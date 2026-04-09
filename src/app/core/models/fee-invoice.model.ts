import { Student } from './student.model';
import { FeePayment } from './fee-payment.model';

export interface FeeInvoice {
    id: number;
    invoice_no: string;
    student_id: number;
    student?: Student;
    academic_year_id: number;
    month: number;
    year: number;
    current_charges: number;
    arrears: number;
    discount_amount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    discount_breakdown?: any;
    fine: number;
    net_amount: number;
    amount_paid: number;
    balance: number;
    due_date: string;
    status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
    payments?: FeePayment[];
}
