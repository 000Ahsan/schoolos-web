import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
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
import { NgxMaskDirective } from 'ngx-mask';
import { TermPipe } from 'app/core/terminology/term.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
            remarks: ['']
        });
    }

    save() {
        if (this.form.valid) {
            const data = { ...this.form.value };
            this._dialogRef.close(data);
        }
    }
}

@Component({
    selector: 'app-student-credentials-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
    template: `
    <mat-dialog-content>
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <p class="text-amber-700 text-sm">
                Please copy these credentials. The password will not be shown again.
            </p>
        </div>
        <div class="flex flex-col gap-4">
            <div class="flex flex-col">
                <span class="text-xs text-secondary font-medium">USERNAME</span>
                <span class="text-lg font-mono bg-gray-100 p-2 rounded">{{data.username}}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-secondary font-medium">PASSWORD</span>
                <span class="text-lg font-mono bg-gray-100 p-2 rounded">{{data.password}}</span>
            </div>
        </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" [mat-dialog-close]="true">I've Saved Them</button>
    </mat-dialog-actions>
    `
})
export class StudentCredentialsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { username: string, password: string }) { }
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
        TitleCasePipe,
        NgxMaskDirective,
        TermPipe,
        MatCheckboxModule
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
    selectedFile: File | null = null;
    previewUrl: string | null = null;

    discountColumns = ['discount_name', 'discount_type', 'discount_value', 'applies_to', 'is_active', 'actions'];

    constructor() {
        this.form = this._fb.group({
            name: ['', Validators.required],
            roll_no: ['', Validators.required],
            father_name: ['', Validators.required],
            class_id: [null, Validators.required],
            date_of_birth: [null, Validators.required],
            gender: [null, Validators.required],
            admission_date: [null, Validators.required],
            b_form_no: [''],
            status: ['active'],
            guardian_name: ['', Validators.required],
            guardian_relation: ['', Validators.required],
            guardian_phone: ['', [Validators.required, Validators.pattern('^\\+92[0-9]{10}$')]],
            guardian_cnic: [''],
            emergency_contact: ['', [Validators.pattern('^\\+92[0-9]{10}$')]],
            address: [''],
            photo_path: [null],
            username: [{ value: '', disabled: true }],
            is_portal_enabled: [true]
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = () => {
                this.previewUrl = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    loadStudent() {
        this.isLoading = true;
        this._apiService.getStudent(this.studentId!).subscribe({
            next: (student) => {
                this.form.patchValue(student);
                if (student.photo_url) {
                    this.previewUrl = student.photo_url;
                }
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

        const formValue = this.form.getRawValue();

        // Format dates
        const formatDate = (date: any) => {
            if (!date) return null;
            if (date.toISODate) return date.toISODate();
            return new Date(date).toISOString().split('T')[0];
        };

        const formData = new FormData();
        Object.keys(formValue).forEach(key => {
            const value = formValue[key];
            if (key === 'date_of_birth' || key === 'admission_date') {
                formData.append(key, formatDate(value) ?? '');
            } else {
                formData.append(key, value ?? '');
            }
        });

        if (this.selectedFile) {
            formData.append('photo', this.selectedFile);
        }

        // Add _method spoofing for PUT requests if editing
        if (this.studentId) {
            formData.append('_method', 'PUT');
        }

        this.isLoading = true;
        // For updates with files, we must use POST with _method=PUT in Laravel
        const req = this.studentId
            ? this._apiService.createStudent(formData, this.studentId) // Use create but with ID override
            : this._apiService.createStudent(formData);

        req.subscribe({
            next: (student: any) => {
                this.isLoading = false;
                this._snackBar.open(`Student ${this.studentId ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });

                if (!this.studentId && student.generated_password) {
                    this._dialog.open(StudentCredentialsDialogComponent, {
                        data: {
                            username: student.username,
                            password: student.generated_password
                        },
                        disableClose: true
                    }).afterClosed().subscribe(() => {
                        this._router.navigate(['/students']);
                    });
                } else {
                    this._router.navigate(['/students']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 422) {
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

    resetPassword() {
        if (confirm('Are you sure you want to reset the password for this student?')) {
            this.isLoading = true;
            this._apiService.resetStudentPassword(this.studentId!).subscribe({
                next: (res: any) => {
                    this.isLoading = false;
                    this._dialog.open(StudentCredentialsDialogComponent, {
                        data: {
                            username: this.form.get('username')?.value,
                            password: res.new_password
                        },
                        disableClose: true
                    });
                },
                error: () => this.isLoading = false
            });
        }
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
