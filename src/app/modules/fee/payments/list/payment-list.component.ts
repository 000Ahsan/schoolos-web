import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';

import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TableSkeletonComponent,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatButtonModule,
    CurrencyPipe,
    DatePipe,
    TitleCasePipe
  ]
})
export class PaymentListComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _fb = inject(FormBuilder);
  private _snackBar = inject(MatSnackBar);

  @ViewChild('drawer') drawer!: MatDrawer;

  filterForm!: FormGroup;
  paymentForm!: FormGroup;
  studentSearchControl = new FormControl('');
  
  displayedColumns = ['student', 'receipt_no', 'invoice', 'amount', 'method', 'date', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = true;
  isSaving = false;

  // Search Results
  filteredStudents$!: Observable<any[]>;
  selectedStudent: any = null;
  studentLedger: any = null;
  
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

  methodIcons: any = {
    'cash': 'heroicons_outline:banknotes',
    'bank_transfer': 'heroicons_outline:building-library',
    'cheque': 'heroicons_outline:envelope',
    'online': 'heroicons_outline:globe-alt'
  };

  constructor() {
    this._initForms();
  }

  private _initForms(): void {
    const today = new Date();
    this.filterForm = this._fb.group({
      search: [''],
      class_id: [null],
      month: [today.getMonth() + 1],
      year: [today.getFullYear()]
    });

    this.paymentForm = this._fb.group({
      student_id: [null, Validators.required],
      amount_paid: [null, [Validators.required, Validators.min(1)]],
      payment_method: ['cash', Validators.required],
      payment_date: [new Date().toISOString().split('T')[0], Validators.required],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    const today = new Date();
    this.years = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2];

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

    // Student Search Logic
    this.filteredStudents$ = this.studentSearchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(val => typeof val === 'string' && val.length > 1),
        switchMap(val => this._apiService.getStudents({ search: val, limit: 10 })),
        map(res => res || [])
    );
  }

  onStudentSelected(student: any): void {
    this.selectedStudent = student;
    this.paymentForm.patchValue({ student_id: student.id });
    this.loadStudentLedger(student.id);
  }

  loadStudentLedger(studentId: number): void {
    this._apiService.getStudentLedger(studentId).subscribe(res => {
        this.studentLedger = res;
        // Default payment amount to total due
        this.paymentForm.patchValue({ amount_paid: res.total_outstanding });
    });
  }

  displayStudent(student: any): string {
    return student ? `${student.name} (${student.roll_no})` : '';
  }

  openDrawer(): void {
    this.studentSearchControl.setValue('');
    this.selectedStudent = null;
    this.studentLedger = null;
    this.paymentForm.reset({
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0]
    });
    this.drawer.open();
  }

  recordPayment(): void {
    if (this.paymentForm.invalid) return;

    this.isSaving = true;
    const val = this.paymentForm.getRawValue();
    
    this._apiService.recordPayment(0, val).subscribe({
        next: () => {
            this._snackBar.open('Payment recorded successfully', 'Close', { duration: 3000 });
            this.isSaving = false;
            this.drawer.close();
            this.loadPayments();
        },
        error: (err) => {
            this.isSaving = false;
            this._snackBar.open(err.error?.error || 'Failed to record payment', 'Close', { duration: 3000 });
        }
    });
  }

  loadClasses(): void {
    this._apiService.getClasses().subscribe(res => this.classes = res);
  }

  loadPayments(): void {
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

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPayments();
  }

  getSelectedMonthLabel(): string {
    const month = this.months.find(m => m.value === this.filterForm?.get('month')?.value);
    return month ? month.label : '';
  }
}
