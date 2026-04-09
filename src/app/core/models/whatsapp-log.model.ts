import { Student } from './student.model';

export interface WhatsAppLog {
    id: number;
    recipient_phone: string;
    student_id?: number;
    student?: Student;
    message_type: 'fee_reminder' | 'fee_receipt' | 'general';
    message_body: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    node_message_id?: string;
    sent_at?: string;
    error_message?: string;
    created_at: string;
}
