import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';

import { ApiService } from 'app/core/services/api.service';
import { DashboardStats } from 'app/core/models';

// Fuse directives and components could be imported if available, but for simplicity we rely on standard Material cards if needed
// Actually, Fuse uses standard Tailwind so standard html works great.

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatCardModule,
        MatIconModule,
        NgApexchartsModule,
        CurrencyPipe,
        DatePipe
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    private _apiService = inject(ApiService);

    stats: DashboardStats | null = null;
    recentPayments: any[] = [];
    classCollection: any[] = [];

    isLoading = true;

    chartOptions: any = {
        series: [],
        chart: { type: 'bar', height: 350 },
        plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: [] },
        yaxis: { title: { text: 'Amount (PKR)' } },
        fill: { opacity: 1 },
        tooltip: { y: { formatter: function (val: number) { return "PKR " + val } } }
    };

    displayedColumns: string[] = ['receipt_no', 'student_name', 'amount', 'payment_method', 'payment_date'];

    constructor() {
        interval(60000)
            .pipe(
                startWith(0),
                takeUntilDestroyed(),
                switchMap(() => {
                    this.isLoading = true;
                    return forkJoin({
                        stats: this._apiService.getDashboardStats(),
                        payments: this._apiService.getRecentPayments(),
                        collection: this._apiService.getClassCollection()
                    });
                })
            )
            .subscribe({
                next: (data) => {
                    this.stats = data.stats;
                    this.recentPayments = data.payments;
                    this.classCollection = data.collection;

                    this.chartOptions.xaxis = { categories: data.collection.map((c: any) => c.class_name) };
                    this.chartOptions.series = [{ name: 'Collected', data: data.collection.map((c: any) => c.collected) }];

                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                }
            });
    }

    ngOnInit(): void { }
}
