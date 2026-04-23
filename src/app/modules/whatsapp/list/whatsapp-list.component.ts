import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from 'app/core/services/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

@Component({
    selector: 'app-whatsapp-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        DatePipe,
        TableSkeletonComponent
    ],
    template: `
    <div class="flex flex-col flex-auto min-w-0 p-8 pt-10">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-8">
        <div>
          <div class="text-3xl font-semibold tracking-tight leading-8">WhatsApp Logs</div>
          <div class="font-medium tracking-tight text-secondary">History of WhatsApp notifications sent via API</div>
        </div>
        
        <div class="mt-4 sm:mt-0 w-full sm:w-80">
          <mat-form-field appearance="outline" class="w-full" [subscriptSizing]="'dynamic'">
            <mat-label>Search phone or student...</mat-label>
            <mat-icon matPrefix svgIcon="heroicons_outline:magnifying-glass" class="icon-size-5 mr-2"></mat-icon>
            <input matInput [formControl]="searchControl" placeholder="Search...">
          </mat-form-field>
        </div>
      </div>

      <div class="flex flex-col flex-auto overflow-hidden bg-card shadow rounded-2xl">
        <div class="overflow-x-auto relative">
          <table mat-table [dataSource]="dataSource" class="w-full min-w-max border-separate border-spacing-0">
            <!-- Student -->
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-secondary uppercase text-xs font-bold tracking-wider"> Student </th>
              <td mat-cell *matCellDef="let log">
                <div class="flex flex-col">
                  <span class="font-bold text-primary">{{log.student?.name}}</span>
                  <span class="text-xs text-secondary">{{log.student?.roll_no}}</span>
                </div>
              </td>
            </ng-container>

            <!-- Phone -->
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-secondary uppercase text-xs font-bold tracking-wider"> Phone No </th>
              <td mat-cell *matCellDef="let log"> {{log.phone_no}} </td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-secondary uppercase text-xs font-bold tracking-wider"> Type </th>
              <td mat-cell *matCellDef="let log">
                <span class="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
                  [ngClass]="log.message_type === 'voucher' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                  {{log.message_type}}
                </span>
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-secondary uppercase text-xs font-bold tracking-wider"> Status </th>
              <td mat-cell *matCellDef="let log">
                <span class="flex items-center" [ngClass]="log.status === 'sent' ? 'text-green-600' : 'text-red-600'">
                  <mat-icon class="icon-size-4 mr-1" [svgIcon]="log.status === 'sent' ? 'heroicons_solid:check-circle' : 'heroicons_solid:x-circle'"></mat-icon>
                  <span class="text-xs font-bold">{{log.status | uppercase}}</span>
                </span>
              </td>
            </ng-container>

            <!-- Date -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef class="bg-gray-50 text-secondary uppercase text-xs font-bold tracking-wider"> Sent At </th>
              <td mat-cell *matCellDef="let log" class="text-secondary text-sm"> {{log.created_at | date:'medium'}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors group"></tr>
          </table>

          <app-table-skeleton *ngIf="isLoading" [rowCount]="10" [columnCount]="5"></app-table-skeleton>

          <div *ngIf="!isLoading && dataSource.data.length === 0"
              class="flex flex-col items-center justify-center p-24 text-center">
            <div class="p-6 bg-gray-100 rounded-full mb-4">
              <mat-icon svgIcon="heroicons_outline:chat-bubble-left-ellipsis" class="icon-size-16 text-hint"></mat-icon>
            </div>
            <div class="text-2xl font-bold tracking-tight text-secondary">No WhatsApp records found</div>
            <div class="mt-1 text-secondary max-w-xs">No notifications have been sent yet or none match your current search criteria.</div>
          </div>
        </div>
        
        <mat-paginator [length]="totalRecords"
                      [pageSize]="pageSize"
                      [pageSizeOptions]="[10, 25, 50, 100]"
                      (page)="onPageChange($event)"
                      class="border-t">
        </mat-paginator>
      </div>
    </div>
  `
})
export class WhatsappListComponent implements OnInit {
    private _apiService = inject(ApiService);

    searchControl = new FormControl('');
    displayedColumns = ['student', 'phone', 'type', 'status', 'date'];
    dataSource = new MatTableDataSource<any>([]);
    
    isLoading = true;
    totalRecords = 0;
    pageSize = 25;
    currentPage = 1;

    ngOnInit() {
        this.loadLogs();

        this.searchControl.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(() => {
            this.currentPage = 1;
            this.loadLogs();
        });
    }

    loadLogs() {
        this.isLoading = true;
        const params = {
            page: this.currentPage,
            per_page: this.pageSize,
            search: this.searchControl.value || ''
        };

        this._apiService.getWhatsAppLogs(params).subscribe({
            next: (res: any) => {
                this.dataSource.data = res.data;
                this.totalRecords = res.total;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    onPageChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadLogs();
    }
}
