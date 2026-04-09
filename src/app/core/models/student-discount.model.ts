export interface StudentDiscount {
    id: number;
    student_id: number;
    discount_name: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'all' | 'tuition_only' | 'specific_head';
    fee_head_name?: string;
    valid_from: string;
    valid_until?: string;
    is_active: boolean;
    approved_by: number;
    remarks?: string;
}
