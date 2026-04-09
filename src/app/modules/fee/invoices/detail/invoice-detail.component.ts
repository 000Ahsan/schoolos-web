import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from 'app/core/services/api.service';
import { RecordPaymentDialogComponent } from './record-payment-dialog.component';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CurrencyPipe,
        DatePipe,
        RouterLink
    ],
    templateUrl: './invoice-detail.component.html'
})
export class InvoiceDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _apiService = inject(ApiService);
    private _dialog = inject(MatDialog);
    private _snackBar = inject(MatSnackBar);

    invoiceId: number;
    invoice: any = null;
    isLoading = true;

    constructor() { }

    ngOnInit() {
        const id = this._route.snapshot.paramMap.get('id');
        if (id) {
            this.invoiceId = +id;
            this.loadInvoice();
        }
    }

    loadInvoice() {
        this.isLoading = true;
        this._apiService.getInvoices().subscribe({
            next: (res) => {
                this.invoice = res.find((i: any) => i.id === this.invoiceId) || res[0];
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    openPaymentDialog() {
        const dialogRef = this._dialog.open(RecordPaymentDialogComponent, { width: '400px' });

        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this._apiService.recordPayment(this.invoiceId, res).subscribe({
                    next: () => {
                        this._snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
                        this.loadInvoice();
                    },
                    error: () => this._snackBar.open('Error recording payment', 'Close', { duration: 3000 })
                });
            }
        });
    }

    printInvoice() {
        window.print();
    }
}
