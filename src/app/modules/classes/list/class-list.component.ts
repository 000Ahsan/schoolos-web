import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';
import { ClassStudentsDialogComponent } from './class-students-dialog.component';

@Component({
    selector: 'app-class-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatTooltipModule,
        MatDividerModule,
        TableSkeletonComponent
    ],
    templateUrl: './class-list.component.html'
})
export class ClassListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _fb = inject(FormBuilder);
    private _snackBar = inject(MatSnackBar);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    private _dialog = inject(MatDialog);

    @ViewChild('drawer') drawer: MatDrawer;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['name', 'section', 'students_count', 'numeric_order', 'capacity', 'is_active', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;
    isSaving = false;

    form: FormGroup;
    selectedId: number | null = null;

    constructor() {
        this.form = this._fb.group({
            name: ['', Validators.required],
            section: [''],
            numeric_order: [1, Validators.required],
            capacity: [30, [Validators.required, Validators.min(1)]],
            is_active: [true]
        });
    }

    ngOnInit() {
        this.loadClasses();
    }

    loadClasses() {
        this.isLoading = true;
        this._apiService.getClasses().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load classes', 'Retry', { duration: 3000 }).onAction().subscribe(() => this.loadClasses());
            }
        });
    }

    openDrawer(mode: 'create' | 'edit', cls?: any) {
        if (mode === 'create') {
            this.selectedId = null;
            this.form.reset({ numeric_order: 1, capacity: 30, is_active: true });
        } else {
            this.selectedId = cls.id;
            this.form.patchValue(cls);
        }
        this.drawer.open();
    }

    closeDrawer() {
        this.drawer.close();
    }

    save() {
        if (this.form.invalid) return;
        this.isSaving = true;
        const req = this.selectedId
            ? this._apiService.updateClass(this.selectedId, this.form.value)
            : this._apiService.createClass(this.form.value);

        req.subscribe({
            next: () => {
                this._snackBar.open(`Class ${this.selectedId ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
                this.isSaving = false;
                this.closeDrawer();
                this.loadClasses();
            },
            error: () => {
                this.isSaving = false;
                this._snackBar.open(`Error saving class`, 'Close', { duration: 3000 });
            }
        });
    }

    deleteClass(cls: any) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Class',
            message: `Are you sure you want to delete ${cls.name} - ${cls.section}? All students in this class will lose their class association. This action cannot be undone!`,
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._apiService.deleteClass(cls.id).subscribe({
                    next: () => {
                        this._snackBar.open('Class deleted successfully', 'Close', { duration: 3000 });
                        this.loadClasses();
                    },
                    error: () => {
                        this._snackBar.open('Error deleting class. It might have students assigned to it.', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    viewStudents(cls: any) {
        this._dialog.open(ClassStudentsDialogComponent, {
            data: { class: cls }
        });
    }
}
