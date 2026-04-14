import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-table-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-4 w-full animate-pulse bg-card">
            <div class="flex items-center space-x-4 py-4 border-b border-gray-100">
                <div *ngFor="let col of columns" [class]="col.width || 'flex-1'" class="h-4 bg-gray-200 rounded"></div>
            </div>
            <div *ngFor="let row of rows" class="flex items-center space-x-4 py-6 border-b border-gray-50 last:border-0">
                <div *ngFor="let col of columns" [class]="col.width || 'flex-1'" class="h-3 bg-gray-100 rounded"></div>
            </div>
        </div>
    `
})
export class TableSkeletonComponent {
    @Input() rowCount: number = 5;
    @Input() columnCount: number = 4;
    
    // Allow custom widths for columns if needed
    @Input() columnWidths: string[] = [];

    get rows() {
        return Array(this.rowCount).fill(0);
    }

    get columns() {
        if (this.columnWidths.length > 0) {
            return this.columnWidths.map(w => ({ width: w }));
        }
        return Array(this.columnCount).fill({ width: 'flex-1' });
    }
}
