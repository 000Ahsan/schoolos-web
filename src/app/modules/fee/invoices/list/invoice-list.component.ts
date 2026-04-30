import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        TableSkeletonComponent,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        CurrencyPipe,
        DatePipe,
        TermPipe
    ],
    templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    @ViewChild('drawer') drawer: MatDrawer;

    displayedColumns = ['student_name', 'invoice_no', 'class', 'billing_month', 'amount', 'total_due', 'due_date', 'status', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;
    isGenerating = false;

    classesList: any[] = [];
    generateForm: FormGroup;
    schoolSettings: any;
    studentLedger: any = null;

    constructor() {
        this.generateForm = this._fb.group({
            billing_month: [new Date().toISOString().substring(0, 7), Validators.required],
            due_date: [{ value: '', disabled: true }],
            classes: [[], Validators.required],
            include_admission: [false],
            include_annual: [false]
        });

        // Auto-calculate due date when billing month changes
        this.generateForm.get('billing_month').valueChanges.subscribe(() => {
            this._calculateDueDate();
        });

        this.filterForm = this._fb.group({
            search: [''],
            class_id: [''],
            status: ['']
        });

        // Listen for filter changes with debounce
        this.filterForm.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(() => {
            this.pageIndex = 0;
            this.loadVouchers();
        });
    }

    filterForm: FormGroup;
    totalRecords = 0;
    pageSize = 10;
    pageIndex = 0;

    ngOnInit() {
        this.loadVouchers();
        this._apiService.getClasses().subscribe(res => this.classesList = res);
        this._apiService.getSchoolSettings().subscribe(settings => {
            this.schoolSettings = settings;
            this._calculateDueDate();
        });
    }

    private _calculateDueDate() {
        const billingMonth = this.generateForm.get('billing_month').value;
        if (!billingMonth || !this.schoolSettings) return;

        if (this.schoolSettings.fee_calculation_mode === 'admission_anniversary') {
            this.generateForm.get('due_date').setValue(null);
            return;
        }

        const [year, month] = billingMonth.split('-').map(Number);
        const day = this.schoolSettings.fee_due_day || 10;

        // Month in Date constructor is 0-indexed
        const date = new Date(year, month - 1, day);
        this.generateForm.get('due_date').setValue(date);
    }

    loadVouchers() {
        this.isLoading = true;

        const params = {
            limit: this.pageSize,
            page: this.pageIndex + 1,
            ...this.filterForm.value
        };

        this._apiService.getInvoices(params).subscribe({
            next: (res) => {
                this.dataSource.data = res.data;
                this.totalRecords = res.total;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load vouchers', 'Close');
            }
        });

        // Fetch ledger if student is filtered
        if (params.student_id) {
            this._apiService.getStudentLedger(params.student_id).subscribe(res => {
                this.studentLedger = {
                    ...res,
                    totalCharged: res.invoices.reduce((acc, inv) => acc + inv.amount, 0),
                    totalPaid: res.invoices.reduce((acc, inv) => acc + inv.paid, 0)
                };
            });
        } else {
            this.studentLedger = null;
        }
    }

    onPageChange(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.loadVouchers();
    }

    sendWhatsApp(invoice: any) {
        this._apiService.sendVoucherWhatsApp(invoice.id).subscribe({
            next: (res) => {
                this._snackBar.open(res.message || 'Voucher sent to WhatsApp', 'Close', { duration: 3000 });
            },
            error: () => {
                this._snackBar.open('Failed to send voucher. Ensure WhatsApp service is running.', 'Close', { duration: 3000 });
            }
        });
    }

    openDrawer() {
        this.drawer.open();
    }

    closeDrawer() {
        this.drawer.close();
    }

    generateVouchers() {
        if (this.generateForm.invalid) return;

        this.isGenerating = true;
        // Use getRawValue because due_date is disabled
        const val = { ...this.generateForm.getRawValue() };

        // Restriction: check if billing_month is in future
        const now = new Date();
        const currentYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (val.billing_month > currentYYMM) {
            this._snackBar.open('You cannot generate vouchers for future months.', 'Close', { duration: 3000 });
            this.isGenerating = false;
            return;
        }

        // Format due_date
        const formatDate = (date: any) => {
            if (!date) return null;
            return new Date(date).toISOString().split('T')[0];
        };
        val.due_date = formatDate(val.due_date);

        this._apiService.generateInvoices(val).subscribe({
            next: (res: any) => {
                this._snackBar.open(res.message || 'Vouchers generated successfully', 'Close', { duration: 3000 });
                this.isGenerating = false;
                this.closeDrawer();
                this.loadVouchers();
            },
            error: (err) => {
                this.isGenerating = false;
                this._snackBar.open(err.error?.error || 'Error generating vouchers', 'Close', { duration: 3000 });
            }
        });
    }

    deleteInvoice(invoice: any) {
        if (invoice.status !== 'pending' && invoice.status !== 'overdue') {
            this._snackBar.open('Only pending or overdue vouchers can be deleted.', 'Close', { duration: 3000 });
            return;
        }

        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Voucher',
            message: `Are you sure you want to delete invoice ${invoice.invoice_no}? This action cannot be undone.`,
            actions: {
                confirm: { label: 'Delete', color: 'warn' }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.isLoading = true;
                this._apiService.deleteInvoice(invoice.id).subscribe({
                    next: () => {
                        this._snackBar.open('Voucher deleted and history restored.', 'Close', { duration: 3000 });
                        this.loadVouchers();
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this._snackBar.open(err.error?.error || 'Failed to delete voucher.', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }
}
