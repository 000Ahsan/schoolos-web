import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StudentPortalService } from 'app/modules/student-portal/student-portal.service';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'student-portal-vouchers',
    templateUrl: './vouchers.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
    ]
})
export class StudentPortalVouchersComponent implements OnInit {
    vouchers: any[] = [];
    loading: boolean = true;

    constructor(private _studentPortalService: StudentPortalService) { }

    ngOnInit(): void {
        this.fetchVouchers();
    }

    fetchVouchers(page: number = 1): void {
        this.loading = true;
        this._studentPortalService.getVouchers(page).subscribe((res) => {
            this.vouchers = res.data;
            this.loading = false;
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

    downloadVoucher(voucher: any): void {
        this._studentPortalService.downloadVoucher(voucher.id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                // Construct filename: [Student Name]-[Roll Number]-[Month]-[Year]-[Timestamp].pdf
                const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T').join('').split('Z')[0];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthName = monthNames[voucher.month - 1];
                const studentName = voucher.student?.name || 'Student';
                const rollNo = voucher.student?.roll_no || '000';

                const filename = `${studentName}-${rollNo}-${monthName}-${voucher.year}-${timestamp}.pdf`.replace(/ /g, '_');

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

