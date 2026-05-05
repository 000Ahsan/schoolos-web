import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

import { ApiService } from 'app/core/services/api.service';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'app-defaulter-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        TableSkeletonComponent,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSidenavModule,
        CurrencyPipe,
        DatePipe,
        TermPipe
    ],
    templateUrl: './defaulter-list.component.html'
})
export class DefaulterListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);

    displayedColumns = ['select', 'student_name', 'class_name', 'guardian_phone', 'unpaid_count', 'total_due', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    selection = new SelectionModel<any>(true, []);
    isLoading = true;

    // Filters
    filterForm: FormGroup;
    classes: any[] = [];

    // Pagination
    totalRecords = 0;
    pageSize = 25;
    pageIndex = 0;

    // Details Drawer
    selectedStudent: any = null;
    studentInvoices: any[] = [];
    isLoadingDetails = false;

    @ViewChild('drawer') drawer: any;

    constructor() {
        this.filterForm = this._fb.group({
            search: [''],
            class_id: ['all']
        });
    }

    ngOnInit() {
        this.loadClasses();
        this.loadDefaulters();

        // Sub to filter changes
        this.filterForm.valueChanges
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe(() => {
                this.pageIndex = 0;
                this.loadDefaulters();
            });
    }

    loadClasses() {
        this._apiService.getClasses().subscribe(res => this.classes = res);
    }

    loadDefaulters() {
        this.isLoading = true;

        const params = {
            page: this.pageIndex + 1,
            per_page: this.pageSize,
            search: this.filterForm.value.search,
            class_id: this.filterForm.value.class_id
        };

        this._apiService.getDefaulters(params).subscribe({
            next: (res) => {
                this.dataSource.data = res.defaulters.data;
                this.totalRecords = res.defaulters.total;
                this.selection.clear();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load defaulters', 'Close');
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.loadDefaulters();
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

    openDetails(student: any) {
        this.selectedStudent = student;
        this.isLoadingDetails = true;
        this.studentInvoices = [];
        this.drawer.open();

        this._apiService.getDefaulterSummary(student.id).subscribe({
            next: (res) => {
                this.studentInvoices = res.invoices;
                this.isLoadingDetails = false;
            },
            error: () => {
                this.isLoadingDetails = false;
                this._snackBar.open('Failed to load invoice details', 'Close');
            }
        });
    }

    sendSingleReminder(row: any) {
        this.isLoading = true;
        this._apiService.sendBulkReminders([row.id]).subscribe({
            next: () => {
                this._snackBar.open('Reminder queued for sending!', 'Close', { duration: 3000 });
                this.isLoading = false;
            },
            error: (err) => {
                this._snackBar.open(err.error?.error || 'Error queuing reminder.', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }

    sendBulkReminders() {
        if (this.selection.selected.length === 0) return;
        const studentIds = this.selection.selected.map(row => row.id);

        this.isLoading = true;
        this._apiService.sendBulkReminders(studentIds).subscribe({
            next: () => {
                this._snackBar.open(`Reminders queued for ${studentIds.length} students!`, 'Close', { duration: 3000 });
                this.selection.clear();
                this.isLoading = false;
            },
            error: (err) => {
                this._snackBar.open(err.error?.error || 'Error queuing bulk reminders.', 'Close', { duration: 3000 });
                this.isLoading = false;
            }
        });
    }
}
