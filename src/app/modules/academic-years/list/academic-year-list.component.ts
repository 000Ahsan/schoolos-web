import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-year-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatDialogModule
    ],
    template: `
    <h2 mat-dialog-title>Add Academic Year</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Year Label</mat-label>
          <input matInput formControlName="label" placeholder="e.g. 2024-2025" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="start_date" required>
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="end_date" required>
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class YearDialogComponent {
    form: FormGroup;
    private _fb = inject(FormBuilder);
    private _dialogRef = inject(MatDialogRef<YearDialogComponent>);

    constructor() {
        this.form = this._fb.group({
            label: ['', Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required]
        });
    }

    save() {
        if (this.form.valid) {
            const val = { ...this.form.value };
            if (val.start_date && val.start_date.toISODate) val.start_date = val.start_date.toISODate();
            else val.start_date = new Date(val.start_date).toISOString().split('T')[0];

            if (val.end_date && val.end_date.toISODate) val.end_date = val.end_date.toISODate();
            else val.end_date = new Date(val.end_date).toISOString().split('T')[0];

            this._dialogRef.close(val);
        }
    }
}

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
        DatePipe
    ],
    templateUrl: './academic-year-list.component.html'
})
export class AcademicYearListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);

    displayedColumns = ['label', 'start_date', 'end_date', 'status', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;

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
                    else status = 'past'; // Default for already passed terms that aren't marked current

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

    openAddDialog() {
        const dialogRef = this._dialog.open(YearDialogComponent, { width: '400px' });
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._apiService.createAcademicYear(res).subscribe({
                    next: () => {
                        this._snackBar.open('Academic Year added successfully', 'Close', { duration: 3000 });
                        this.loadYears();
                    },
                    error: () => this._snackBar.open('Error creating academic year', 'Close', { duration: 3000 })
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
