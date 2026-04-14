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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ApiService } from 'app/core/services/api.service';

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
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatPaginatorModule,
        MatTooltipModule,
        ReactiveFormsModule,
        CurrencyPipe,
        DatePipe
    ],
    templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);

    @ViewChild('drawer') drawer: MatDrawer;

    displayedColumns = ['student_name', 'invoice_no', 'class', 'billing_month', 'amount', 'due_date', 'status', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;
    isGenerating = false;

    classesList: any[] = [];
    generateForm: FormGroup;
    schoolSettings: any;

    constructor() {
        this.generateForm = this._fb.group({
            billing_month: [new Date().toISOString().substring(0, 7), Validators.required],
            due_date: [{ value: '', disabled: true }, Validators.required],
            classes: [[], Validators.required]
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
            error: () => {
                this.isGenerating = false;
                this._snackBar.open('Error generating vouchers', 'Close', { duration: 3000 });
            }
        });
    }
}
