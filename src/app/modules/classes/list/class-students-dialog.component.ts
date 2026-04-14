import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from 'app/core/services/api.service';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

@Component({
    selector: 'app-class-students-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        CurrencyPipe,
        TableSkeletonComponent
    ],
    template: `
        <div class="flex flex-col max-h-[90vh] min-w-[600px] sm:min-w-[800px]">
            <div class="flex items-center justify-between px-6 py-4">
                <div class="flex flex-col">
                    <div class="text-xl font-bold">Students in {{ data.class.name }} - {{ data.class.section }}</div>
                    <div class="text-sm text-secondary">{{ students.length }} students enrolled</div>
                </div>
                <div class="flex items-center gap-2">
                    <button mat-flat-button color="primary" 
                            (click)="sendBulkReminders()" 
                            [disabled]="isLoading || !hasDefaulters()"
                            matTooltip="Send Bulk Reminders to students with due balance">
                        <mat-icon svgIcon="heroicons_outline:chat-bubble-left-right"></mat-icon>
                        <span class="ml-2">Send Reminders</span>
                    </button>
                    <button mat-stroked-button 
                            (click)="downloadCSV()" 
                            [disabled]="isLoading || students.length === 0">
                        <mat-icon svgIcon="heroicons_outline:arrow-down-tray"></mat-icon>
                        <span class="ml-2">Download CSV</span>
                    </button>
                    <button mat-icon-button mat-dialog-close>
                        <mat-icon svgIcon="heroicons_outline:x-mark"></mat-icon>
                    </button>
                </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="flex-auto overflow-y-auto px-6 py-4">
                <table mat-table [dataSource]="students" class="w-full" *ngIf="!isLoading">
                    <ng-container matColumnDef="roll_no">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase w-20"> Roll No </th>
                        <td mat-cell *matCellDef="let student"> {{student.roll_no}} </td>
                    </ng-container>

                    <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase"> Name / Father </th>
                        <td mat-cell *matCellDef="let student"> 
                            <div class="flex flex-col py-2">
                                <span class="font-bold text-primary">{{student.name}}</span>
                                <span class="text-xs text-secondary">{{student.father_name}}</span>
                            </div>
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="balance">
                        <th mat-header-cell *matHeaderCellDef class="font-bold text-xs uppercase text-right"> Balance Due </th>
                        <td mat-cell *matCellDef="let student" class="text-right"> 
                            <span [ngClass]="student.balance > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-medium'">
                                {{ student.balance | currency:'PKR':'symbol':'1.0-0' }}
                            </span>
                        </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns" class="h-10 bg-gray-50"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="h-12 hover:bg-gray-50 transition-colors"></tr>
                </table>

                <app-table-skeleton *ngIf="isLoading" [rowCount]="5" [columnCount]="3"></app-table-skeleton>

                <div *ngIf="!isLoading && students.length === 0" class="p-16 text-center text-secondary">
                    <mat-icon svgIcon="heroicons_outline:user-group" class="icon-size-12 mb-4 text-hint"></mat-icon>
                    <div>No students currently enrolled in this class.</div>
                </div>
            </div>

            <div class="bg-gray-50 px-6 py-4 border-t flex items-center justify-between" *ngIf="!isLoading && students.length \u003e 0">
                <div class="text-sm font-medium text-secondary">
                    Total Class Due: <span class="text-red-600 font-bold ml-1">{{ totalClassBalance | currency:'PKR':'symbol':'1.0-0' }}</span>
                </div>
                <button mat-button color="primary" mat-dialog-close>Close</button>
            </div>
        </div>
    `
})
export class ClassStudentsDialogComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    data = inject(MAT_DIALOG_DATA);

    students = [];
    isLoading = true;
    isSendingReminders = false;
    displayedColumns = ['roll_no', 'name', 'balance'];

    get totalClassBalance(): number {
        return this.students.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
    }

    ngOnInit() {
        this.loadStudents();
    }

    loadStudents() {
        this.isLoading = true;
        this._apiService.getStudents({ class_id: this.data.class.id }).subscribe({
            next: (res) => {
                this.students = res;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Error loading students', 'Close', { duration: 3000 });
            }
        });
    }

    hasDefaulters(): boolean {
        return this.students.some(s => s.balance > 0);
    }

    sendBulkReminders() {
        const studentIds = this.students
            .filter(s => s.balance > 0)
            .map(s => s.id);

        if (studentIds.length === 0) return;

        this.isSendingReminders = true;
        this._apiService.sendBulkReminders(studentIds).subscribe({
            next: () => {
                this._snackBar.open(`WhatsApp reminders queued for ${studentIds.length} students!`, 'Close', { duration: 3000 });
                this.isSendingReminders = false;
            },
            error: () => {
                this._snackBar.open('Error sending bulk reminders. Ensure WhatsApp service is running.', 'Close', { duration: 3000 });
                this.isSendingReminders = false;
            }
        });
    }

    downloadCSV() {
        if (this.students.length === 0) return;

        const headers = ['Roll No', 'Name', 'Father Name', 'Phone', 'Balance Due'];
        const csvRows = [
            headers.join(','),
            ...this.students.map(s => [
                s.roll_no,
                `"${s.name}"`,
                `"${s.father_name}"`,
                s.guardian_phone || '',
                s.balance || 0
            ].join(','))
        ];

        const csvContent = csvRows.join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `Students_${this.data.class.name}_${this.data.class.section}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
