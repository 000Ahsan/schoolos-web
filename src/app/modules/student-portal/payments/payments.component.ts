import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentPortalService } from 'app/modules/student-portal/student-portal.service';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'student-portal-payments',
    templateUrl: './payments.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        TermPipe
    ]
})
export class StudentPortalPaymentsComponent implements OnInit {
    payments: any[] = [];
    loading: boolean = true;

    constructor(private _studentPortalService: StudentPortalService) {}

    ngOnInit(): void {
        this.fetchPayments();
    }

    fetchPayments(page: number = 1): void {
        this.loading = true;
        this._studentPortalService.getPayments(page).subscribe((res) => {
            this.payments = res.data;
            this.loading = false;
        });
    }

    downloadReceipt(payment: any): void {
        this._studentPortalService.downloadReceipt(payment.id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Construct filename: [Student Name]-[Roll Number]-Receipt-[Receipt No]-[Timestamp].pdf
                const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T').join('').split('Z')[0];
                const studentName = payment.student?.name || 'Student';
                const rollNo = payment.student?.roll_no || '000';
                
                const filename = `${studentName}-${rollNo}-Receipt-${payment.receipt_no}-${timestamp}.pdf`.replace(/ /g, '_');
                
                link.download = filename;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                // Error handling
            }
        });
    }
}

