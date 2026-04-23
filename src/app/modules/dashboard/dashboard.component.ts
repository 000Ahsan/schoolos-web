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
import { TableSkeletonComponent } from 'app/shared/components/table-skeleton/table-skeleton.component';
import { TermPipe } from 'app/core/terminology/term.pipe';

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
        DatePipe,
        TableSkeletonComponent,
        TermPipe
    ],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    private _apiService = inject(ApiService);

    stats: any = null;
    recentPayments: any[] = [];
    isLoading = true;

    // Charts
    classChartOptions: any;
    weeklyChartOptions: any;

    displayedColumns: string[] = ['receipt_no', 'student_name', 'amount', 'payment_method', 'payment_date'];

    constructor() {
        this._initCharts();

        interval(60000)
            .pipe(
                startWith(0),
                takeUntilDestroyed(),
                switchMap(() => forkJoin({
                    stats: this._apiService.getDashboardStats(),
                    payments: this._apiService.getRecentPayments(),
                    classColl: this._apiService.getClassCollection(),
                    weeklyColl: this._apiService.getWeeklyCollection()
                }))
            )
            .subscribe({
                next: (res) => {
                    this.stats = res.stats;
                    this.recentPayments = res.payments;

                    // Update Class Collection Chart
                    this.classChartOptions.series = [{
                        name: 'Amount Collected',
                        data: res.classColl.map(c => c.total)
                    }];
                    this.classChartOptions.xaxis = {
                        categories: res.classColl.map(c => c.name)
                    };

                    // Update Weekly Trend Chart
                    this.weeklyChartOptions.series = [{
                        name: 'Daily Collection',
                        data: res.weeklyColl.map(w => w.total)
                    }];
                    this.weeklyChartOptions.xaxis = {
                        categories: res.weeklyColl.map(w => w.date)
                    };

                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.isLoading = false;
                }
            });
    }

    ngOnInit(): void { }

    private _initCharts(): void {
        this.classChartOptions = {
            series: [],
            chart: { type: 'bar', height: 300, toolbar: { show: false }, animations: { enabled: true } },
            plotOptions: { bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 } },
            dataLabels: { enabled: false },
            colors: ['#04342C'],
            xaxis: { categories: [], axisBorder: { show: false } },
            yaxis: { labels: { formatter: (val: number) => `PKR ${val.toLocaleString()}` } },
            grid: { padding: { left: 0, right: 0 } },
            tooltip: { theme: 'dark' }
        };

        this.weeklyChartOptions = {
            series: [],
            chart: { type: 'area', height: 300, toolbar: { show: false }, sparkline: { enabled: false } },
            dataLabels: { enabled: false },
            colors: ['#04342C'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0, stops: [0, 90, 100] } },
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { categories: [], axisBorder: { show: false } },
            yaxis: { labels: { formatter: (val: number) => `PKR ${val.toLocaleString()}` } },
            tooltip: { theme: 'dark' }
        };
    }
}
