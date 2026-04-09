export interface FeeStructure {
    id: number;
    class_id: number;
    academic_year_id: number;
    fee_head: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annually' | 'one_time';
    is_active: boolean;
}
