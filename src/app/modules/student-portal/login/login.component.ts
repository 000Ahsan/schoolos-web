import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { StudentAuthService } from 'app/core/auth/student-auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'student-portal-login',
    templateUrl: './login.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
})
export class StudentPortalLoginComponent implements OnInit {
    loginForm: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    constructor(
        private _authService: StudentAuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.loginForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
        });
    }

    signIn(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loginForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.loginForm.value).subscribe(
            () => {
                this._router.navigateByUrl('/student/dashboard');
            },
            (response) => {
                this.loginForm.enable();
                this.alert = {
                    type: 'error',
                    message: response.error?.error || 'Invalid email or password',
                };
                this.showAlert = true;
            }
        );
    }
}
