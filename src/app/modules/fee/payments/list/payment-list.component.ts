import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe
  ]
})
export class PaymentListComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _fb = inject(FormBuilder);

  filterForm: FormGroup;
  displayedColumns = ['student', 'receipt_no', 'invoice', 'amount', 'method', 'date'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;

  // Pagination
  totalRecords = 0;
  pageSize = 25;
  currentPage = 1;

  // Stats
  stats: any = {
    total_amount: 0,
    count: 0
  };

  // Filter Data
  classes: any[] = [];
  months = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 },
    { label: 'March', value: 3 }, { label: 'April', value: 4 },
    { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 },
    { label: 'September', value: 9 }, { label: 'October', value: 10 },
    { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];
  years: number[] = [];

  methodIcons = {
    'cash': 'heroicons_outline:banknotes',
    'bank_transfer': 'heroicons_outline:building-library',
    'cheque': 'heroicons_outline:envelope',
    'online': 'heroicons_outline:globe-alt'
  };

  ngOnInit() {
    const today = new Date();
    this.years = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2];

    this.filterForm = this._fb.group({
      search: [''],
      class_id: [null],
      month: [today.getMonth() + 1],
      year: [today.getFullYear()]
    });

    this.loadClasses();
    this.loadPayments();

    // Listen for filter changes
    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadPayments();
    });
  }

  loadClasses() {
    this._apiService.getClasses().subscribe(res => this.classes = res);
  }

  loadPayments() {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      per_page: this.pageSize,
      ...this.filterForm.getRawValue()
    };

    this._apiService.getPayments(params).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.payments.data;
        this.totalRecords = res.payments.total;
        this.stats = res.stats;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPayments();
  }

  getSelectedMonthLabel(): string {
    const month = this.months.find(m => m.value === this.filterForm?.get('month')?.value);
    return month ? month.label : '';
  }
}
