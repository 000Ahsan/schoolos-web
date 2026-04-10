import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-student-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    displayedColumns: string[] = ['photo', 'roll_no', 'name', 'father_name', 'class', 'status', 'parent_phone', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    classes: any[] = [];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    isLoading = true;
    totalCount = 0;

    filterSearch = '';
    filterClass = '';
    filterStatus = '';

    constructor() { }

    ngOnInit(): void {
        this.loadClasses();
        this.loadStudents();
    }

    loadClasses() {
        this._apiService.getClasses().subscribe(res => {
            this.classes = res;
        });
    }

    loadStudents() {
        this.isLoading = true;
        this._apiService.getStudents().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.totalCount = res.length;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this._setupFilters();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load students', 'Retry', { duration: 3000 }).onAction().subscribe(() => this.loadStudents());
            }
        });
    }

    private _setupFilters() {
        this.dataSource.filterPredicate = (data: any, filterStr: string) => {
            const { search, cls, status } = JSON.parse(filterStr);
            let matches = true;
            if (search) {
                const term = search.toLowerCase();
                matches = matches && (data.name?.toLowerCase().includes(term) || data.roll_no?.toLowerCase().includes(term));
            }
            if (cls && cls !== 'all') {
                matches = matches && data.class_id === cls;
            }
            if (status && status !== 'all') {
                matches = matches && data.status === status;
            }
            return matches;
        };
    }

    applyFilters() {
        if (!this.dataSource) return;
        this.dataSource.filter = JSON.stringify({
            search: this.filterSearch,
            cls: this.filterClass,
            status: this.filterStatus
        });
    }

    deleteStudent(student: any) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Student',
            message: `Are you sure you want to delete ${student.name}? This action cannot be undone!`,
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this._apiService.deleteStudent(student.id).subscribe({
                    next: () => {
                        this._snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
                        this.loadStudents();
                    },
                    error: () => {
                        this._snackBar.open('Failed to delete student', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
