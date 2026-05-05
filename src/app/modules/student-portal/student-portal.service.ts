import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentPortalService {
    private _httpClient = inject(HttpClient);

    getDashboardData(): Observable<any> {
        return this._httpClient.get(environment.apiUrl + '/student/dashboard');
    }

    getVouchers(page: number = 1): Observable<any> {
        return this._httpClient.get(environment.apiUrl + '/student/vouchers?page=' + page);
    }

    getVoucherDetails(id: string): Observable<any> {
        return this._httpClient.get(environment.apiUrl + '/student/vouchers/' + id);
    }

    getPayments(page: number = 1): Observable<any> {
        return this._httpClient.get(environment.apiUrl + '/student/payments?page=' + page);
    }

    downloadVoucher(id: number): Observable<Blob> {
        return this._httpClient.get(`${environment.apiUrl}/student/vouchers/${id}/download`, { responseType: 'blob' });
    }

    downloadReceipt(id: number): Observable<Blob> {
        return this._httpClient.get(`${environment.apiUrl}/student/payments/${id}/receipt`, { responseType: 'blob' });
    }
}
