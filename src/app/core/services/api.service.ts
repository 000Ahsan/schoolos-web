import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private _http = inject(HttpClient);
    private _apiUrl = environment.apiUrl;

    // Students
    getStudents(params?: any): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/students`, { params }); }
    getStudent(id: number): Observable<any> { return this._http.get<any>(`${this._apiUrl}/students/${id}`); }
    createStudent(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/students`, data); }
    updateStudent(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/students/${id}`, data); }
    deleteStudent(id: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/students/${id}`); }

    // Classes
    getClasses(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/classes`); }
    createClass(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/classes`, data); }
    updateClass(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/classes/${id}`, data); }

    // Academic Years
    getAcademicYears(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/academic-years`); }
    createAcademicYear(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/academic-years`, data); }
    setCurrentAcademicYear(id: number): Observable<any> { return this._http.post<any>(`${this._apiUrl}/academic-years/${id}/set-current`, {}); }
    promoteStudents(id: number): Observable<any> { return this._http.post<any>(`${this._apiUrl}/academic-years/${id}/promote-students`, {}); }

    // Discounts
    getStudentDiscounts(studentId: number): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/students/${studentId}/discounts`); }
    createDiscount(studentId: number, data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/students/${studentId}/discounts`, data); }
    updateDiscount(studentId: number, discountId: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/students/${studentId}/discounts/${discountId}`, data); }
    deactivateDiscount(studentId: number, discountId: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/students/${studentId}/discounts/${discountId}`); }

    // Fee Structures
    getFeeStructures(class_id?: number, academic_year_id?: number): Observable<any[]> {
        let params = new HttpParams();
        if (class_id) params = params.set('class_id', class_id.toString());
        if (academic_year_id) params = params.set('academic_year_id', academic_year_id.toString());
        return this._http.get<any[]>(`${this._apiUrl}/fee/structures`, { params });
    }
    createFeeStructure(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/structures`, data); }
    updateFeeStructure(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/fee/structures/${id}`, data); }

    // Fee Invoices
    getInvoices(params?: any): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/fee/invoices`, { params }); }
    generateInvoices(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/invoices/generate`, data); }
    getInvoice(id: number): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/invoices/${id}`); }
    getDefaulters(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/fee/defaulters`); }

    // Fee Payments
    recordPayment(invoiceId: number, data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/invoices/${invoiceId}/payments`, data); }
    getReceipt(paymentId: number): Observable<Blob> { return this._http.get(`${this._apiUrl}/fee/payments/${paymentId}/receipt`, { responseType: 'blob' }); }

    // WhatsApp
    sendWhatsAppReminder(data: { student_ids: number[] }): Observable<any> { return this._http.post<any>(`${this._apiUrl}/whatsapp/reminders/send`, data); }
    getWhatsAppLogs(params?: any): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/whatsapp/logs`, { params }); }

    // Dashboard
    getDashboardStats(): Observable<any> { return this._http.get<any>(`${this._apiUrl}/dashboard/stats`); }
    getRecentPayments(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/dashboard/recent-payments`); }
    getClassCollection(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/dashboard/class-collection`); }
}
