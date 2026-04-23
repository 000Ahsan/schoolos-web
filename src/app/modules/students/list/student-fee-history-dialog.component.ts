import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from 'app/core/services/api.service';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

@Component({
    selector: 'app-student-fee-history-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatChipsModule,
        CurrencyPipe,
        TableSkeletonComponent
    ],
    template: `
        <div class="flex flex-col max-h-[90vh] min-w-[600px] sm:min-w-[900px]">
            <div class="flex items-center justify-between px-6 py-4">
                <div class="flex flex-col">
                    <div class="text-xl font-bold">Fee History: {{ data.student.name }}</div>
                    <div class="text-sm text-secondary">Roll No: {{ data.student.roll_no }} | Father: {{ data.student.father_name }}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button *ngIf="currentBalance > 0" mat-flat-button color="primary" 
                            (click)="sendReminder()" 
                            [disabled]="isSending"
                            matTooltip="Send WhatsApp Reminder for balance due">
                        <mat-icon svgIcon="heroicons_outline:chat-bubble-left-right"></mat-icon>
                        <span class="ml-2">Send Reminder</span>
                    </button>
                    <button mat-icon-button mat-dialog-close>
                        <mat-icon svgIcon="heroicons_outline:x-mark"></mat-icon>
                    </button>
                </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="flex-auto overflow-y-auto px-6 py-4">
                <table mat-table [dataSource]="invoices" class="w-full" *ngIf="!isLoading">
                    <ng-container matColumnDef="invoice_no">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase w-32"> Invoice # </th>
                        <td mat-cell *matCellDef="let invoice"> 
                            <span class="font-mono text-xs">{{invoice.invoice_no}}</span>
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="month">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase"> Month </th>
                        <td mat-cell *matCellDef="let invoice"> 
                            {{ getMonthName(invoice.month) }} {{ invoice.year }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase text-right"> Net Amount </th>
                        <td mat-cell *matCellDef="let invoice" class="text-right font-medium"> 
                            {{ invoice.net_amount | currency:'PKR':'symbol':'1.0-0' }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="paid">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase text-right"> Paid </th>
                        <td mat-cell *matCellDef="let invoice" class="text-right text-green-600"> 
                            {{ invoice.amount_paid | currency:'PKR':'symbol':'1.0-0' }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="balance">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase text-right"> Balance </th>
                        <td mat-cell *matCellDef="let invoice" class="text-right font-bold" [ngClass]="invoice.balance > 0 ? 'text-red-600' : 'text-secondary'"> 
                            {{ invoice.balance | currency:'PKR':'symbol':'1.0-0' }}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase text-center w-24"> Status </th>
                        <td mat-cell *matCellDef="let invoice" class="text-center"> 
                            <mat-chip-listbox selectable="false">
                                <mat-chip 
                                    [ngClass]="{
                                        'bg-green-100 text-green-700': invoice.status === 'paid',
                                        'bg-red-100 text-red-700': invoice.status === 'overdue',
                                        'bg-yellow-100 text-yellow-700': invoice.status === 'pending' || invoice.status === 'partial',
                                        'bg-gray-100 text-gray-700': invoice.status === 'carried_forward'
                                    }"
                                    class="text-[10px] font-bold h-6 min-h-0 uppercase">
                                    {{ invoice.status }}
                                </mat-chip>
                            </mat-chip-listbox>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns" class="h-10 bg-gray-50"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="h-12 hover:bg-gray-50 transition-colors"></tr>
                </table>

                <app-table-skeleton *ngIf="isLoading" [rowCount]="5" [columnCount]="6"></app-table-skeleton>

                <div *ngIf="!isLoading && invoices.length === 0"
                    class="flex flex-col items-center justify-center p-16 text-center">
                    <div class="p-6 bg-gray-100 rounded-full mb-4">
                        <mat-icon svgIcon="heroicons_outline:banknotes" class="icon-size-16 text-hint"></mat-icon>
                    </div>
                    <div class="text-2xl font-bold tracking-tight text-secondary">No fee history found</div>
                    <div class="mt-1 text-secondary max-w-xs">There are no generated invoices or payment records for this student yet.</div>
                </div>
            </div>

            <div class="bg-gray-50 px-6 py-4 border-t flex items-center justify-between" *ngIf="!isLoading && invoices.length > 0">
                <div class="flex gap-8 text-sm font-medium">
                    <div>Total Paid: <span class="text-green-600 font-bold">{{ totalPaid | currency:'PKR':'symbol':'1.0-0' }}</span></div>
                    <div>Remaining Dues: <span class="text-red-600 font-bold">{{ currentBalance | currency:'PKR':'symbol':'1.0-0' }}</span></div>
                </div>
                <button mat-button color="primary" mat-dialog-close>Close</button>
            </div>
        </div>
    `
})
export class StudentFeeHistoryDialogComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    data = inject(MAT_DIALOG_DATA);

    invoices = [];
    isLoading = true;
    isSending = false;
    displayedColumns = ['invoice_no', 'month', 'amount', 'paid', 'balance', 'status'];

    get totalPaid(): number {
        return this.invoices.reduce((acc, curr) => acc + (parseFloat(curr.amount_paid) || 0), 0);
    }

    get currentBalance(): number {
        // Only count balance from non-carried_forward invoices (as those are summed into current ones usually)
        // However, to be safe and accurate, we show what's currently active.
        return this.invoices
            .filter(i => i.status !== 'carried_forward')
            .reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
    }

    ngOnInit() {
        this.loadHistory();
    }

    loadHistory() {
        this.isLoading = true;
        // In this app, getInvoices often returns a paginated object or data array.
        // We'll pass student_id to filter.
        this._apiService.getInvoices({ student_id: this.data.student.id, limit: 100 }).subscribe({
            next: (res) => {
                // Determine if res is paginated or direct array
                this.invoices = res.data ? res.data : (Array.isArray(res) ? res : []);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Error loading fee history', 'Close', { duration: 3000 });
            }
        });
    }

    getMonthName(monthNum: number): string {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[monthNum - 1] || 'Unknown';
    }

    sendReminder() {
        this.isSending = true;
        this._apiService.sendBulkReminders([this.data.student.id]).subscribe({
            next: () => {
                this._snackBar.open('WhatsApp reminder queued successfully!', 'Close', { duration: 3000 });
                this.isSending = false;
            },
            error: () => {
                this._snackBar.open('Failed to send reminder. Check WhatsApp service.', 'Close', { duration: 3000 });
                this.isSending = false;
            }
        });
    }
}
