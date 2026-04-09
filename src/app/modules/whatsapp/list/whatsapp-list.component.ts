import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-whatsapp-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatProgressSpinnerModule,
        DatePipe
    ],
    template: `
    <div class="flex flex-col flex-auto min-w-0 p-8 pt-10">
      <div class="flex items-center justify-between w-full mb-8">
        <div>
          <div class="text-3xl font-semibold tracking-tight leading-8">WhatsApp Logs</div>
          <div class="font-medium tracking-tight text-secondary">History of WhatsApp notifications sent via API</div>
        </div>
      </div>

      <div class="flex flex-col flex-auto overflow-hidden bg-card shadow rounded-2xl">
        <div class="overflow-x-auto relative">
          <table mat-table [dataSource]="dataSource" class="w-full min-w-max">
            
            <ng-container matColumnDef="sent_to">
              <th mat-header-cell *matHeaderCellDef> Phone Number </th>
              <td mat-cell *matCellDef="let element" class="font-medium"> {{element.sent_to_phone}} </td>
            </ng-container>

            <ng-container matColumnDef="student_name">
              <th mat-header-cell *matHeaderCellDef> Related Student </th>
              <td mat-cell *matCellDef="let element"> {{element.student?.name}} </td>
            </ng-container>

            <ng-container matColumnDef="message_content">
              <th mat-header-cell *matHeaderCellDef class="w-1/2"> Message Content </th>
              <td mat-cell *matCellDef="let element"> 
                <div class="py-4 text-sm text-secondary whitespace-pre-wrap">{{element.message_content}}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
                  [ngClass]="element.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{element.status}}
                </span>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="sent_at">
              <th mat-header-cell *matHeaderCellDef> Sent At </th>
              <td mat-cell *matCellDef="let element"> {{element.sent_at | date:'dd MMM yyyy, h:mm a'}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="border-b"></tr>
          </table>

          <div *ngIf="isLoading" class="p-8 text-center text-hint">
            <mat-spinner diameter="32" class="mx-auto mb-4"></mat-spinner>
            Loading logs...
          </div>
          <div *ngIf="!isLoading && dataSource.data.length === 0" class="p-16 text-center">
            <mat-icon svgIcon="heroicons_outline:chat-bubble-left-ellipsis" class="icon-size-12 text-hint mb-4"></mat-icon>
            <div class="text-lg font-medium text-secondary">No WhatsApp messages have been sent yet.</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsappListComponent implements OnInit {
    private _apiService = inject(ApiService);

    displayedColumns = ['sent_to', 'student_name', 'message_content', 'sent_at', 'status'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;

    ngOnInit() {
        this._apiService.getWhatsAppLogs().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
}
