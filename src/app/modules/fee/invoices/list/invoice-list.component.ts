import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-generate-invoice-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatDialogModule
    ],
    template: `
    <h2 mat-dialog-title>Bulk Generate Invoices</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Month</mat-label>
          <input matInput type="month" formControlName="billing_month" required>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="duePicker" formControlName="due_date" required>
          <mat-datepicker-toggle matIconSuffix [for]="duePicker"></mat-datepicker-toggle>
          <mat-datepicker #duePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Target Classes</mat-label>
          <mat-select formControlName="classes" multiple required>
            <mat-option *ngFor="let cls of classesList" [value]="cls.id">{{ cls.name }}</mat-option>
          </mat-select>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Generate</button>
    </mat-dialog-actions>
  `
})
export class GenerateInvoiceDialogComponent implements OnInit {
    form: FormGroup;
    private _fb = inject(FormBuilder);
    private _dialogRef = inject(MatDialogRef<GenerateInvoiceDialogComponent>);
    private _apiService = inject(ApiService);

    classesList: any[] = [];

    constructor() {
        this.form = this._fb.group({
            billing_month: ['', Validators.required],
            due_date: [null, Validators.required],
            classes: [[], Validators.required]
        });
    }

    ngOnInit() {
        this._apiService.getClasses().subscribe(res => this.classesList = res);
    }

    save() {
        if (this.form.valid) {
            const val = { ...this.form.value };
            if (val.due_date && val.due_date.toISODate) val.due_date = val.due_date.toISODate();
            else if (val.due_date) val.due_date = new Date(val.due_date).toISOString().split('T')[0];
            this._dialogRef.close(val);
        }
    }
}

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe
    ],
    templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);

    displayedColumns = ['invoice_no', 'student_name', 'class', 'billing_month', 'amount', 'due_date', 'status'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;

    constructor() { }

    ngOnInit() {
        this.loadInvoices();
    }

    loadInvoices() {
        this.isLoading = true;
        this._apiService.getInvoices().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load invoices', 'Close');
            }
        });
    }

    openGenerateDialog() {
        const dialogRef = this._dialog.open(GenerateInvoiceDialogComponent, { width: '400px' });

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.isLoading = true;
                this._apiService.generateInvoices(res).subscribe({
                    next: () => {
                        this._snackBar.open('Invoices generation started', 'Close', { duration: 3000 });
                        this.loadInvoices();
                    },
                    error: () => {
                        this.isLoading = false;
                        this._snackBar.open('Error generating invoices', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
