import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from 'app/core/services/api.service';

@Component({
    selector: 'app-discount-dialog',
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
    <h2 mat-dialog-title>Add Discount</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4 pt-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Discount Name</mat-label>
          <input matInput formControlName="discount_name" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Discount Type</mat-label>
          <mat-select formControlName="discount_type" required>
            <mat-option value="percentage">Percentage (%)</mat-option>
            <mat-option value="fixed">Fixed Amount (PKR)</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ form.get('discount_type')?.value === 'percentage' ? 'Percentage (%)' : 'Amount (PKR)' }}</mat-label>
          <input matInput type="number" formControlName="discount_value" required min="0">
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Applies To</mat-label>
          <mat-select formControlName="applies_to" required>
            <mat-option value="all">All Fees</mat-option>
            <mat-option value="tuition_only">Tuition Only</mat-option>
            <mat-option value="specific_head">Specific Fee Head</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field *ngIf="form.get('applies_to')?.value === 'specific_head'" appearance="outline" class="w-full">
          <mat-label>Fee Head Name</mat-label>
          <input matInput formControlName="fee_head_name">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Valid From</mat-label>
          <input matInput [matDatepicker]="pickerFrom" formControlName="valid_from" required>
          <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
          <mat-datepicker #pickerFrom></mat-datepicker>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Valid Until</mat-label>
          <input matInput [matDatepicker]="pickerUntil" formControlName="valid_until">
          <mat-datepicker-toggle matIconSuffix [for]="pickerUntil"></mat-datepicker-toggle>
          <mat-datepicker #pickerUntil></mat-datepicker>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Remarks</mat-label>
          <textarea matInput formControlName="remarks" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class DiscountDialogComponent {
    form: FormGroup;
    private _fb = inject(FormBuilder);
    private _dialogRef = inject(MatDialogRef<DiscountDialogComponent>);

    constructor() {
        this.form = this._fb.group({
            discount_name: ['', Validators.required],
            discount_type: ['percentage', Validators.required],
            discount_value: [null, [Validators.required, Validators.min(0)]],
            applies_to: ['all', Validators.required],
            fee_head_name: [''],
            valid_from: [null, Validators.required],
            valid_until: [null],
            remarks: ['']
        });
    }

    save() {
        if (this.form.valid) {
            const data = { ...this.form.value };
            if (data.valid_from) data.valid_from = data.valid_from.toISODate ? data.valid_from.toISODate() : new Date(data.valid_from).toISOString().split('T')[0];
            if (data.valid_until) data.valid_until = data.valid_until.toISODate ? data.valid_until.toISODate() : new Date(data.valid_until).toISOString().split('T')[0];
            this._dialogRef.close(data);
        }
    }
}

@Component({
    selector: 'app-student-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatIconModule,
        MatSnackBarModule,
        MatTableModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe,
        TitleCasePipe
    ],
    templateUrl: './student-form.component.html'
})
export class StudentFormComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);
    private _fb = inject(FormBuilder);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _dialog = inject(MatDialog);

    form: FormGroup;
    studentId: number | null = null;
    classes: any[] = [];
    discounts: any[] = [];
    isLoading = false;

    discountColumns = ['discount_name', 'discount_type', 'discount_value', 'applies_to', 'valid_from', 'valid_until', 'is_active', 'actions'];

    constructor() {
        this.form = this._fb.group({
            name: ['', Validators.required],
            roll_no: ['', Validators.required],
            father_name: ['', Validators.required],
            class_id: [null, Validators.required],
            date_of_birth: [null],
            gender: [null],
            admission_date: [null, Validators.required],
            b_form_no: [''],
            status: ['active'],
            parent_name: [''],
            parent_phone: ['', [Validators.required, Validators.pattern('^\\+92[0-9]{10}$')]],
            parent_whatsapp: [''],
            parent_cnic: [''],
            emergency_contact: [''],
            address: ['']
        });
    }

    ngOnInit() {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.studentId = +id;
        }

        this._apiService.getClasses().subscribe(cls => this.classes = cls);

        if (this.studentId) {
            this.loadStudent();
            this.loadDiscounts();
        }
    }

    loadStudent() {
        this.isLoading = true;
        this._apiService.getStudent(this.studentId!).subscribe({
            next: (student) => {
                this.form.patchValue(student);
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    loadDiscounts() {
        this._apiService.getStudentDiscounts(this.studentId!).subscribe(ds => this.discounts = ds);
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const val = { ...this.form.value };
        if (val.date_of_birth && val.date_of_birth.toISODate) val.date_of_birth = val.date_of_birth.toISODate();
        else if (val.date_of_birth) val.date_of_birth = new Date(val.date_of_birth).toISOString().split('T')[0];

        if (val.admission_date && val.admission_date.toISODate) val.admission_date = val.admission_date.toISODate();
        else if (val.admission_date) val.admission_date = new Date(val.admission_date).toISOString().split('T')[0];

        this.isLoading = true;
        const req = this.studentId
            ? this._apiService.updateStudent(this.studentId, val)
            : this._apiService.createStudent(val);

        req.subscribe({
            next: () => {
                this._snackBar.open(`Student ${this.studentId ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
                this._router.navigate(['/students']);
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422) {
                    // Apply errors locally - mock fallback
                    this._snackBar.open('Form validation error', 'Close', { duration: 3000 });
                }
            }
        });
    }

    openDiscountDialog() {
        this._dialog.open(DiscountDialogComponent, { width: '500px' })
            .afterClosed()
            .subscribe(res => {
                if (res) {
                    this._apiService.createDiscount(this.studentId!, res).subscribe({
                        next: () => {
                            this._snackBar.open('Discount added', 'Close', { duration: 3000 });
                            this.loadDiscounts();
                        }
                    });
                }
            });
    }

    deactivateDiscount(discountId: number) {
        if (confirm('Deactivate this discount?')) {
            this._apiService.deactivateDiscount(this.studentId!, discountId).subscribe({
                next: () => {
                    this._snackBar.open('Discount deactivated', 'Close', { duration: 3000 });
                    this.loadDiscounts();
                }
            });
        }
    }
}
