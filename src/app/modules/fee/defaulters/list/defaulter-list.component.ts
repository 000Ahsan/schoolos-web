import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-defaulter-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe
    ],
    templateUrl: './defaulter-list.component.html'
})
export class DefaulterListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);

    displayedColumns = ['select', 'student_name', 'class_name', 'parent_phone', 'unpaid_amount', 'due_date', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    selection = new SelectionModel<any>(true, []);
    isLoading = true;

    constructor() { }

    ngOnInit() {
        this.loadDefaulters();
    }

    loadDefaulters() {
        this.isLoading = true;
        this._apiService.getDefaulters().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.selection.clear();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load defaulters', 'Close');
            }
        });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    sendSingleReminder(row: any) {
        this.isLoading = true;
        this._apiService.sendWhatsAppReminder({ student_ids: [row.student_id] }).subscribe({
            next: () => {
                this._snackBar.open('WhatsApp reminder sent!', 'Close', { duration: 3000 });
                this.isLoading = false;
            },
            error: () => {
                this._snackBar.open('Error sending reminder.', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    sendBulkReminders() {
        if (this.selection.selected.length === 0) return;
        const studentIds = this.selection.selected.map(row => row.student_id);

        this.isLoading = true;
        this._apiService.sendWhatsAppReminder({ student_ids: studentIds }).subscribe({
            next: () => {
                this._snackBar.open(`Reminders sent to ${studentIds.length} students!`, 'Close', { duration: 3000 });
                this.selection.clear();
                this.isLoading = false;
            },
            error: () => {
                this._snackBar.open('Error sending bulk reminders.', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }
}
