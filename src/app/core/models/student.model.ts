import { SchoolClass } from './class.model';

export interface Student {
    id: number;
    roll_no: string;
    name: string;
    father_name: string;
    class_id: number;
    class?: SchoolClass;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    admission_date: string;
    b_form_no?: string;
    address?: string;
    photo_path?: string;
    parent_name?: string;
    parent_phone: string;
    parent_whatsapp?: string;
    parent_cnic?: string;
    emergency_contact?: string;
    status: 'active' | 'left' | 'graduated' | 'suspended';
    created_at: string;
    updated_at: string;
}
