import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-fee-structure-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule
    ],
    template: `
    <h2 mat-dialog-title>Add Fee Structure</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Academic Year</mat-label>
          <mat-select formControlName="academic_year_id" required>
            <mat-option *ngFor="let year of academicYears" [value]="year.id">{{ year.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Target Classes</mat-label>
          <mat-select formControlName="classes" multiple required>
            <mat-option *ngFor="let cls of classesList" [value]="cls.id">{{ cls.name }}</mat-option>
          </mat-select>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Fee Head Name</mat-label>
          <input matInput formControlName="fee_head_name" placeholder="e.g. Tuition Fee" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Amount (PKR)</mat-label>
          <input matInput type="number" formControlName="amount" required min="1">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Period</mat-label>
          <mat-select formControlName="period" required>
            <mat-option value="monthly">Monthly</mat-option>
            <mat-option value="yearly">Yearly</mat-option>
          </mat-select>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class FeeStructureDialogComponent implements OnInit {
    form: FormGroup;
    private _fb = inject(FormBuilder);
    private _dialogRef = inject(MatDialogRef<FeeStructureDialogComponent>);
    private _apiService = inject(ApiService);

    academicYears: any[] = [];
    classesList: any[] = [];

    constructor() {
        this.form = this._fb.group({
            academic_year_id: [null, Validators.required],
            classes: [[], Validators.required], // Array of class IDs
            fee_head_name: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            period: ['monthly', Validators.required]
        });
    }

    ngOnInit() {
        // Ideally we pass these in via MAT_DIALOG_DATA or fetch them here. Fetching here for simplicity in MVP.
        this._apiService.getAcademicYears().subscribe(res => this.academicYears = res);
        this._apiService.getClasses().subscribe(res => this.classesList = res);
    }

    save() {
        if (this.form.valid) {
            this._dialogRef.close(this.form.value);
        }
    }
}

@Component({
    selector: 'app-fee-structure-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe
    ],
    templateUrl: './fee-structure-list.component.html'
})
export class FeeStructureListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);

    displayedColumns = ['academic_year', 'fee_head_name', 'amount', 'period', 'classes_applied', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;

    constructor() { }

    ngOnInit() {
        this.loadStructures();
    }

    loadStructures() {
        this.isLoading = true;
        this._apiService.getFeeStructures().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load fee structures', 'Close');
            }
        });
    }

    openAddDialog() {
        const dialogRef = this._dialog.open(FeeStructureDialogComponent, { width: '500px' });

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._apiService.createFeeStructure(res).subscribe({
                    next: () => {
                        this._snackBar.open('Fee structure created successfully', 'Close', { duration: 3000 });
                        this.loadStructures();
                    },
                    error: () => this._snackBar.open('Error creating fee structure', 'Close', { duration: 3000 })
                });
            }
        });
    }
}
