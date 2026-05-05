import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from 'app/core/services/api.service';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'app-payment-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe,
        TitleCasePipe,
        RouterLink,
        TermPipe
    ],
    templateUrl: './payment-detail.component.html'
})
export class PaymentDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);

    paymentId: number;
    payment: any = null;
    schoolSettings: any = null;
    isLoading = true;

    ngOnInit() {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.paymentId = +id;
            this.loadPayment();
        }
        this._apiService.getSchoolSettings().subscribe(settings => this.schoolSettings = settings);
    }

    loadPayment() {
        this.isLoading = true;
        this._apiService.getPayment(this.paymentId).subscribe({
            next: (res) => {
                this.payment = res;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Error loading payment details', 'Close', { duration: 3000 });
            }
        });
    }

    downloadReceipt() {
        if (!this.payment) return;
        
        this._apiService.getReceipt(this.payment.id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Construct filename: [Student Name]-[Roll Number]-Receipt-[Receipt No]-[Timestamp].pdf
                const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T').join('').split('Z')[0];
                const studentName = this.payment.student?.name || 'Student';
                const rollNo = this.payment.student?.roll_no || '000';
                
                const filename = `${studentName}-${rollNo}-Receipt-${this.payment.receipt_no}-${timestamp}.pdf`.replace(/ /g, '_');
                
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this._snackBar.open('Error downloading receipt', 'Close', { duration: 3000 });
            }
        });
    }
}


