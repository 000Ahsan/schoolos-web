import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-promote-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatIconModule
    ],
    template: `
    <h2 mat-dialog-title class="text-red-600 flex items-center">
      <mat-icon svgIcon="heroicons_outline:exclamation-triangle" class="mr-2 icon-size-6"></mat-icon>
      CRITICAL OPERATION
    </h2>
    <mat-dialog-content>
      <div class="py-4 font-medium text-gray-800 leading-relaxed">
        WARNING: This will permanently promote all active students to the next class based on their numeric_order and set this term as the active term. Old balances will be carried forward.
      </div>
      <div class="mt-4 text-sm text-secondary mb-4">
        To confirm, please type <strong>PROMOTE</strong> below.
      </div>
      <mat-form-field appearance="outline" class="w-full mt-2">
        <mat-label>Confirmation code</mat-label>
        <input matInput [formControl]="confirmControl">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="pb-4 pr-4">
      <button mat-stroked-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [disabled]="confirmControl.value !== 'PROMOTE'" (click)="confirm()">Confirm Promotion</button>
    </mat-dialog-actions>
  `
})
export class PromoteDialogComponent {
    private _dialogRef = inject(MatDialogRef<PromoteDialogComponent>);
    private _fb = inject(FormBuilder);

    confirmControl = this._fb.control('');

    confirm() {
        if (this.confirmControl.value === 'PROMOTE') {
            this._dialogRef.close(true);
        }
    }
}

@Component({
    selector: 'app-academic-year-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        DatePipe
    ],
    templateUrl: './academic-year-list.component.html'
})
export class AcademicYearListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    @ViewChild('drawer') drawer: MatDrawer;

    displayedColumns = ['label', 'start_date', 'end_date', 'status', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;
    isSaving = false;
    selectedId: number | null = null;
    form: FormGroup;

    constructor() {
        this.form = this._fb.group({
            label: ['', Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadYears();
    }

    loadYears() {
        this.isLoading = true;
        this._apiService.getAcademicYears().subscribe({
            next: (res) => {
                const today = new Date().toISOString().split('T')[0];
                this.dataSource.data = res.map(y => {
                    let status = 'past';
                    if (y.is_current) status = 'current';
                    else if (y.start_date > today) status = 'upcoming';
                    else if (y.end_date < today) status = 'past';
                    else status = 'past';

                    return { ...y, status };
                });
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load academic years', 'Close');
            }
        });
    }

    openDrawer(mode: 'add' | 'edit', year?: any) {
        if (mode === 'add') {
            this.selectedId = null;
            this.form.reset();
        } else {
            this.selectedId = year.id;
            this.form.patchValue(year);
        }
        this.drawer.open();
    }

    closeDrawer() {
        this.drawer.close();
    }

    save() {
        if (this.form.invalid) return;
        this.isSaving = true;

        const val = { ...this.form.value };
        const formatDate = (date: any) => {
            if (!date) return null;
            if (date.toISODate) return date.toISODate();
            return new Date(date).toISOString().split('T')[0];
        };

        val.start_date = formatDate(val.start_date);
        val.end_date = formatDate(val.end_date);

        const request = this.selectedId
            ? this._apiService.updateAcademicYear(this.selectedId, val)
            : this._apiService.createAcademicYear(val);

        request.subscribe({
            next: () => {
                this._snackBar.open(`Academic Year ${this.selectedId ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 });
                this.isSaving = false;
                this.closeDrawer();
                this.loadYears();
            },
            error: () => {
                this.isSaving = false;
                this._snackBar.open('Error saving academic year', 'Close', { duration: 3000 });
            }
        });
    }

    deleteYear(year: any) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Academic Year',
            message: `Are you sure you want to delete ${year.label}? This will not delete students or grades but might cause issues with fee tracking linked to this year.`,
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._apiService.deleteAcademicYear(year.id).subscribe({
                    next: () => {
                        this._snackBar.open('Academic Year deleted successfully', 'Close', { duration: 3000 });
                        this.loadYears();
                    },
                    error: () => this._snackBar.open('Error deleting academic year', 'Close', { duration: 3000 })
                });
            }
        });
    }

    openPromoteDialog(yearId: number) {
        const dialogRef = this._dialog.open(PromoteDialogComponent, { width: '500px', disableClose: true });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.isLoading = true;
                this._apiService.promoteStudents(yearId).subscribe({
                    next: () => {
                        this._snackBar.open('Operation successful! System term updated.', 'Close', { duration: 5000 });
                        this.loadYears();
                    },
                    error: () => {
                        this.isLoading = false;
                        this._snackBar.open('Error promoting students.', 'Close', { duration: 5000 });
                    }
                });
            }
        });
    }
}
