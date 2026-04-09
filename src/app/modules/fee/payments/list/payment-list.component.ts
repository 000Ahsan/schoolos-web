import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-payment-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe,
        TitleCasePipe
    ],
    template: `
    <div class="flex flex-col flex-auto min-w-0 p-8 pt-10">
      <div class="flex items-center justify-between w-full mb-8">
        <div>
          <div class="text-3xl font-semibold tracking-tight leading-8">Payments Repository</div>
          <div class="font-medium tracking-tight text-secondary">History of all fee payments received</div>
        </div>
      </div>

      <div class="flex flex-col flex-auto overflow-hidden bg-card shadow rounded-2xl">
        <div class="overflow-x-auto relative">
          <table mat-table [dataSource]="dataSource" class="w-full min-w-max">
            
            <ng-container matColumnDef="receipt_no">
              <th mat-header-cell *matHeaderCellDef> Receipt No. </th>
              <td mat-cell *matCellDef="let element" class="font-medium text-blue-600"> {{element.receipt_no}} </td>
            </ng-container>

            <ng-container matColumnDef="invoice_no">
              <th mat-header-cell *matHeaderCellDef> Source Invoice </th>
              <td mat-cell *matCellDef="let element"> {{element.fee_invoice?.invoice_no || element.invoice_id}} </td>
            </ng-container>

            <ng-container matColumnDef="student_name">
              <th mat-header-cell *matHeaderCellDef> Student </th>
              <td mat-cell *matCellDef="let element"> {{element.student?.name}} </td>
            </ng-container>

            <ng-container matColumnDef="amount_paid">
              <th mat-header-cell *matHeaderCellDef> Amount Paid </th>
              <td mat-cell *matCellDef="let element" class="font-semibold text-green-600"> {{element.amount_paid | currency:'PKR':'symbol':'1.2-2'}} </td>
            </ng-container>

            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef> Method </th>
              <td mat-cell *matCellDef="let element"> {{element.payment_method | titlecase}} </td>
            </ng-container>
            
            <ng-container matColumnDef="payment_date">
              <th mat-header-cell *matHeaderCellDef> Date </th>
              <td mat-cell *matCellDef="let element"> {{element.payment_date | date:'dd MMM yyyy'}} </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
          </table>

          <div *ngIf="isLoading" class="p-8 text-center text-hint">
            <mat-spinner diameter="32" class="mx-auto mb-4"></mat-spinner>
            Loading payments...
          </div>
          <div *ngIf="!isLoading && dataSource.data.length === 0" class="p-16 text-center">
            <mat-icon svgIcon="heroicons_outline:credit-card" class="icon-size-12 text-hint mb-4"></mat-icon>
            <div class="text-lg font-medium text-secondary">No payments tracked yet.</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentListComponent implements OnInit {
    private _apiService = inject(ApiService);

    displayedColumns = ['receipt_no', 'invoice_no', 'student_name', 'amount_paid', 'method', 'payment_date'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;

    ngOnInit() {
        this._apiService.getRecentPayments().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }
}
