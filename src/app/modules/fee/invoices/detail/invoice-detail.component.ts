import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { ApiService } from 'app/core/services/api.service';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatSidenavModule,
        CurrencyPipe,
        DatePipe,
        RouterLink,
        TermPipe
    ],
    templateUrl: './invoice-detail.component.html'
})
export class InvoiceDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);

    @ViewChild('drawer') drawer: MatDrawer;

    voucherId: number;
    voucher: any = null;
    schoolSettings: any = null;
    isLoading = true;
    isSendingWhatsApp = false;
    isSubmittingPayment = false;
    paymentForm: FormGroup;

    constructor() {
        this.paymentForm = this._fb.group({
            amount_paid: [null, [Validators.required, Validators.min(1)]],
            payment_method: ['cash', Validators.required],
            payment_date: [new Date(), Validators.required],
            remarks: ['']
        });
    }

    ngOnInit() {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.voucherId = +id;
            this.loadVoucher();
        }
        this._apiService.getSchoolSettings().subscribe(settings => this.schoolSettings = settings);
    }

    loadVoucher() {
        this.isLoading = true;
        this._apiService.getInvoice(this.voucherId).subscribe({
            next: (res) => {
                this.voucher = res;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    openPaymentDrawer() {
        this.paymentForm.patchValue({
            amount_paid: this.voucher.total_payable,
            payment_date: new Date(),
            remarks: ''
        });
        this.drawer.open();
    }

    submitPayment() {
        if (this.paymentForm.invalid) return;

        this.isSubmittingPayment = true;
        const val = { ...this.paymentForm.value };
        
        // Format date to local YYYY-MM-DD
        const date = new Date(val.payment_date);
        val.payment_date = date.getFullYear() + '-' + 
                         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(date.getDate()).padStart(2, '0');

        this._apiService.recordPayment(this.voucherId, val).subscribe({
            next: () => {
                this._snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
                this.isSubmittingPayment = false;
                this.drawer.close();
                this.loadVoucher();
            },
            error: () => {
                this._snackBar.open('Error recording payment', 'Close', { duration: 3000 });
                this.isSubmittingPayment = false;
            }
        });
    }

    sendWhatsApp() {
        this.isSendingWhatsApp = true;
        this._apiService.sendVoucherWhatsApp(this.voucherId).subscribe({
            next: (res) => {
                this._snackBar.open(res.message || 'Voucher sent to WhatsApp', 'Close', { duration: 3000 });
                this.isSendingWhatsApp = false;
            },
            error: () => {
                this._snackBar.open('Failed to send voucher. Ensure WhatsApp service is running.', 'Close', { duration: 3000 });
                this.isSendingWhatsApp = false;
            }
        });
    }

    downloadVoucher() {
        if (!this.voucher) return;
        
        this._apiService.getVoucherPdf(this.voucherId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Construct filename for client-side download as well
                const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T').join('').split('Z')[0];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthName = monthNames[this.voucher.month - 1];
                const filename = `${this.voucher.student.name}-${this.voucher.student.roll_no}-${monthName}-${this.voucher.year}-${timestamp}.pdf`.replace(/ /g, '_');
                
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this._snackBar.open('Error downloading voucher', 'Close', { duration: 3000 });
            }
        });
    }
}

