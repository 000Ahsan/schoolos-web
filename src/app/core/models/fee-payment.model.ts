export interface FeePayment {
    id: number;
    invoice_id: number;
    received_by: number;
    amount_paid: number;
    payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'online';
    reference_no?: string;
    payment_date: string;
    remarks?: string;
    receipt_no: string;
}
