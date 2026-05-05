import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentPortalService } from 'app/modules/student-portal/student-portal.service';
import { RouterLink } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';



@Component({
    selector: 'student-portal-dashboard',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        RouterLink,
        CurrencyPipe,
        DatePipe,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSidenavModule
    ]
})
export class StudentPortalDashboardComponent implements OnInit {
    data: any;
    loading: boolean = true;
    isSaving: boolean = false;
    
    @ViewChild('drawer') drawer: MatDrawer;
    
    passwordForm: FormGroup;
    currentPasswordVisible = false;
    newPasswordVisible = false;
    confirmPasswordVisible = false;

    private _fb = inject(FormBuilder);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);

    constructor(private _studentPortalService: StudentPortalService) {
        this.passwordForm = this._fb.group({
            current_password: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(8)]],
            password_confirmation: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password').value === g.get('password_confirmation').value
           ? null : {'mismatch': true};
    }

    ngOnInit(): void {
        this._studentPortalService.getDashboardData().subscribe((res) => {
            this.data = res;
            this.loading = false;
        });
    }

    openChangePasswordDrawer(): void {
        this.passwordForm.reset();
        this.currentPasswordVisible = false;
        this.newPasswordVisible = false;
        this.confirmPasswordVisible = false;
        this.drawer.open();
    }

    closeDrawer(): void {
        this.drawer.close();
    }

    updatePassword(): void {
        if (this.passwordForm.invalid) return;
        this.isSaving = true;
        this._apiService.changeStudentPassword(this.passwordForm.value).subscribe({
            next: () => {
                this.isSaving = false;
                this._snackBar.open('Password updated successfully', 'Close', { duration: 3000 });
                this.closeDrawer();
            },
            error: (err) => {
                this.isSaving = false;
                this._snackBar.open(err.error.message || 'Error updating password', 'Close', { duration: 3000 });
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status.toLowerCase()) {
            case 'paid': return 'text-green-600 bg-green-100';
            case 'partial': return 'text-blue-600 bg-blue-100';
            case 'pending': return 'text-amber-600 bg-amber-100';
            case 'overdue': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    getMonthName(month: number): string {
        const date = new Date();
        date.setMonth(month - 1);
        return date.toLocaleString('default', { month: 'long' });
    }
}
