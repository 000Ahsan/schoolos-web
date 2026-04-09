import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-record-payment-dialog',
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
    <h2 mat-dialog-title>Record Payment</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Amount to Receive</mat-label>
          <input matInput type="number" formControlName="amount_paid" required min="1">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Payment Method</mat-label>
          <mat-select formControlName="payment_method" required>
            <mat-option value="cash">Cash</mat-option>
            <mat-option value="bank_transfer">Bank Transfer</mat-option>
            <mat-option value="cheque">Cheque</mat-option>
            <mat-option value="online">Online</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="datePicker" formControlName="payment_date" required>
          <mat-datepicker-toggle matIconSuffix [for]="datePicker"></mat-datepicker-toggle>
          <mat-datepicker #datePicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Remarks / Reference</mat-label>
          <textarea matInput formControlName="remarks" rows="2"></textarea>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Receive Payment</button>
    </mat-dialog-actions>
  `
})
export class RecordPaymentDialogComponent {
    form: FormGroup;
    private _fb = inject(FormBuilder);
    private _dialogRef = inject(MatDialogRef<RecordPaymentDialogComponent>);

    constructor() {
        this.form = this._fb.group({
            amount_paid: [null, [Validators.required, Validators.min(1)]],
            payment_method: ['cash', Validators.required],
            payment_date: [new Date(), Validators.required],
            remarks: ['']
        });
    }

    save() {
        if (this.form.valid) {
            const val = { ...this.form.value };
            if (val.payment_date && val.payment_date.toISODate) val.payment_date = val.payment_date.toISODate();
            else val.payment_date = new Date(val.payment_date).toISOString().split('T')[0];
            this._dialogRef.close(val);
        }
    }
}
