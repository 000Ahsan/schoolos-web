import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from 'app/core/services/api.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-school-settings',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSnackBarModule
    ],
    templateUrl: './school.component.html'
})
export class SchoolSettingsComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _fb = inject(FormBuilder);
    private _snackBar = inject(MatSnackBar);

    form: FormGroup;
    isLoading = true;
    isSaving = false;
    logoPreview: string | ArrayBuffer | null = null;

    constructor() {
        this.form = this._fb.group({
            school_name: ['', Validators.required],
            address: [''],
            phone: [''],
            email: ['', [Validators.email]],
            currency: ['PKR'],
            fee_due_day: [10, [Validators.min(1), Validators.max(31)]],
            late_fine_per_month: [0],
            whatsapp_node_url: [''],
            logo: [null]
        });
    }

    ngOnInit(): void {
        this._apiService.getSchoolSettings().subscribe({
            next: (settings) => {
                if (settings) {
                    this.form.patchValue(settings);
                    if (settings.logo_url) {
                        this.logoPreview = settings.logo_url;
                    }
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Error loading settings', 'Close', { duration: 3000 });
            }
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.form.patchValue({ logo: file });
            const reader = new FileReader();
            reader.onload = () => {
                this.logoPreview = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }

    save(): void {
        if (this.form.invalid) return;
        this.isSaving = true;

        this._apiService.updateSchoolSettings(this.form.value).subscribe({
            next: () => {
                this.isSaving = false;
                this._snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
            },
            error: () => {
                this.isSaving = false;
                this._snackBar.open('Error saving settings', 'Close', { duration: 3000 });
            }
        });
    }
}
