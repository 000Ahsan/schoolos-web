export interface SchoolClass {
    id: number;
    name: string;
    section?: string;
    numeric_order: number;
    capacity: number;
    is_active: boolean;
}
