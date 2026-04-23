import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from 'app/core/services/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';
import { TermPipe } from 'app/core/terminology/term.pipe';

@Component({
  selector: 'app-whatsapp-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    TableSkeletonComponent,
    TermPipe
  ],
  templateUrl: './whatsapp-list.component.html'
})
export class WhatsappListComponent implements OnInit {
  private _apiService = inject(ApiService);

  searchControl = new FormControl('');
  displayedColumns = ['student', 'phone', 'type', 'status', 'date'];
  dataSource = new MatTableDataSource<any>([]);

  isLoading = true;
  totalRecords = 0;
  pageSize = 25;
  currentPage = 1;

  ngOnInit() {
    this.loadLogs();

    this.searchControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadLogs();
    });
  }

  loadLogs() {
    this.isLoading = true;
    const params = {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.searchControl.value || ''
    };

    this._apiService.getWhatsAppLogs(params).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data;
        this.totalRecords = res.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }
}
