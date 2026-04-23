import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from 'app/core/services/api.service';
import { HttpClient } from '@angular/common/http';
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
        MatProgressSpinnerModule,
        MatSnackBarModule
    ],
    templateUrl: './school.component.html'
})
export class SchoolSettingsComponent implements OnInit, OnDestroy {
    private _apiService = inject(ApiService);
    private _http = inject(HttpClient);
    private _fb = inject(FormBuilder);
    private _snackBar = inject(MatSnackBar);

    form: FormGroup;
    isLoading = true;
    isSaving = false;
    logoPreview: string | ArrayBuffer | null = null;
    
    tenantId: string | null = null;
    whatsappStatus: string = 'disconnected';
    whatsappQr: string | null = null;
    whatsappPollingInterval: any;

    constructor() {
        this.form = this._fb.group({
            school_name: ['', Validators.required],
            address: [''],
            phone: [''],
            email: ['', [Validators.email]],
            currency: ['PKR'],
            fee_due_day: [10, [Validators.min(1), Validators.max(31)]],
            late_fine_per_month: [0],
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
                    if (settings.tenant_id) {
                        this.tenantId = settings.tenant_id;
                        this.checkWhatsAppStatus();
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

    ngOnDestroy(): void {
        this.stopPolling();
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
                // Check WhatsApp status again in case url changed
                if (this.tenantId) {
                    this.checkWhatsAppStatus();
                }
            },
            error: () => {
                this.isSaving = false;
                this._snackBar.open('Error saving settings', 'Close', { duration: 3000 });
            }
        });
    }

    checkWhatsAppStatus(): void {
        const nodeUrl = environment.whatsappGatewayUrl;
        if (!nodeUrl || !this.tenantId) return;

        this._http.get(`${nodeUrl}/status/${this.tenantId}`).subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.whatsappStatus = res.status;
                    this.whatsappQr = res.qr || null;

                    if (this.whatsappStatus === 'initializing' || this.whatsappStatus === 'qr_ready') {
                        this.startPolling();
                    } else {
                        this.stopPolling();
                    }
                }
            },
            error: () => {
                this.whatsappStatus = 'disconnected';
                this.stopPolling();
            }
        });
    }

    initWhatsApp(): void {
        const nodeUrl = environment.whatsappGatewayUrl;
        if (!nodeUrl || !this.tenantId) {
            this._snackBar.open('WhatsApp Gateway URL is not configured in the environment.', 'Close', { duration: 3000 });
            return;
        }
        
        this.whatsappStatus = 'initializing';
        this.startPolling();

        this._http.post(`${nodeUrl}/init/${this.tenantId}`, {}).subscribe({
            next: () => {
                this._snackBar.open('Initializing WhatsApp...', 'Close', { duration: 2000 });
            },
            error: () => {
                this.whatsappStatus = 'disconnected';
                this.stopPolling();
                this._snackBar.open('Error initializing WhatsApp client', 'Close', { duration: 3000 });
            }
        });
    }

    logoutWhatsApp(): void {
        const nodeUrl = environment.whatsappGatewayUrl;
        if (!nodeUrl || !this.tenantId) return;

        this._http.post(`${nodeUrl}/logout/${this.tenantId}`, {}).subscribe({
            next: () => {
                this.whatsappStatus = 'disconnected';
                this.whatsappQr = null;
                this.stopPolling();
                this._snackBar.open('WhatsApp logged out successfully', 'Close', { duration: 3000 });
            },
            error: () => {
                this._snackBar.open('Error logging out', 'Close', { duration: 3000 });
            }
        });
    }

    startPolling(): void {
        if (!this.whatsappPollingInterval) {
            this.whatsappPollingInterval = setInterval(() => {
                this.checkWhatsAppStatus();
            }, 3000);
        }
    }

    stopPolling(): void {
        if (this.whatsappPollingInterval) {
            clearInterval(this.whatsappPollingInterval);
            this.whatsappPollingInterval = null;
        }
    }
}
