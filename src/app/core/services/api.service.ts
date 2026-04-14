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
    createStudent(data: any, id?: number): Observable<any> { 
        const url = id ? `${this._apiUrl}/students/${id}` : `${this._apiUrl}/students`;
        return this._http.post<any>(url, data); 
    }
    updateStudent(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/students/${id}`, data); }
    deleteStudent(id: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/students/${id}`); }

    // Classes
    getClasses(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/classes`); }
    createClass(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/classes`, data); }
    updateClass(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/classes/${id}`, data); }
    deleteClass(id: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/classes/${id}`); }

    // Academic Years
    getAcademicYears(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/academic-years`); }
    createAcademicYear(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/academic-years`, data); }
    updateAcademicYear(id: number, data: any): Observable<any> { return this._http.put<any>(`${this._apiUrl}/academic-years/${id}`, data); }
    deleteAcademicYear(id: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/academic-years/${id}`); }
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
    deleteFeeStructure(id: number): Observable<any> { return this._http.delete<any>(`${this._apiUrl}/fee/structures/${id}`); }

    // Fee Invoices
    getInvoices(params: any = {}): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/invoices`, { params }); }
    generateInvoices(data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/invoices/generate`, data); }
    getInvoice(id: number): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/invoices/${id}`); }
    getDefaulters(params: any = {}): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/defaulters`, { params }); }
    getDefaulterSummary(id: number): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/defaulters/${id}`); }
    sendBulkReminders(student_ids: number[]): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/defaulters/bulk-remind`, { student_ids }); }

    // Fee Payments
    recordPayment(invoiceId: number, data: any): Observable<any> { return this._http.post<any>(`${this._apiUrl}/fee/invoices/${invoiceId}/payments`, data); }
    getPayments(params: any = {}): Observable<any> { return this._http.get<any>(`${this._apiUrl}/fee/payments`, { params }); }
    getReceipt(paymentId: number): Observable<Blob> { return this._http.get(`${this._apiUrl}/fee/payments/${paymentId}/receipt`, { responseType: 'blob' }); }

    // WhatsApp
    sendVoucherWhatsApp(invoiceId: number): Observable<any> { return this._http.post<any>(`${this._apiUrl}/whatsapp/voucher/${invoiceId}`, {}); }
    sendWhatsAppReminder(data: { student_ids: number[] }): Observable<any> { return this._http.post<any>(`${this._apiUrl}/whatsapp/reminders/send`, data); }
    getWhatsAppLogs(params?: any): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/whatsapp/logs`, { params }); }

    // Dashboard
    getDashboardStats(): Observable<any> { return this._http.get<any>(`${this._apiUrl}/dashboard/stats`); }
    getRecentPayments(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/dashboard/recent-payments`); }
    getClassCollection(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/dashboard/class-collection`); }
    getWeeklyCollection(): Observable<any[]> { return this._http.get<any[]>(`${this._apiUrl}/dashboard/weekly-collection`); }
    
    // Settings
    getSchoolSettings(): Observable<any> { return this._http.get<any>(`${this._apiUrl}/school-settings`); }
    updateSchoolSettings(data: any): Observable<any> { 
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return this._http.post<any>(`${this._apiUrl}/school-settings`, formData); 
    }
}
