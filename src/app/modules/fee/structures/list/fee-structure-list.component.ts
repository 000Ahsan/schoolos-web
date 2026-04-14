import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';

import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-fee-structure-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        CurrencyPipe
    ],
    templateUrl: './fee-structure-list.component.html'
})
export class FeeStructureListComponent implements OnInit {
    private _apiService = inject(ApiService);
    private _snackBar = inject(MatSnackBar);
    private _fb = inject(FormBuilder);
    private _fuseConfirmationService = inject(FuseConfirmationService);

    @ViewChild('drawer') drawer: MatDrawer;

    displayedColumns = ['academic_year', 'fee_head_name', 'amount', 'period', 'classes_applied', 'actions'];
    dataSource = new MatTableDataSource<any>([]);
    isLoading = true;
    isSaving = false;
    
    academicYears: any[] = [];
    classesList: any[] = [];
    selectedId: number | null = null;
    form: FormGroup;

    constructor() {
        this.form = this._fb.group({
            academic_year_id: [null, Validators.required],
            classes: [[], Validators.required], // Array of class IDs
            fee_head_name: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(1)]],
            period: ['monthly', Validators.required]
        });
    }

    ngOnInit() {
        this.loadStructures();
        this.loadMetaData();
    }

    loadMetaData() {
        this._apiService.getAcademicYears().subscribe(res => this.academicYears = res);
        this._apiService.getClasses().subscribe(res => this.classesList = res);
    }

    loadStructures() {
        this.isLoading = true;
        this._apiService.getFeeStructures().subscribe({
            next: (res) => {
                this.dataSource.data = res;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._snackBar.open('Failed to load fee structures', 'Close');
            }
        });
    }

    openDrawer(mode: 'add' | 'edit', structure?: any) {
        if (mode === 'add') {
            this.selectedId = null;
            this.form.reset({ period: 'monthly' });
            // Set current academic year if available
            const currentYear = this.academicYears.find(y => y.is_current);
            if (currentYear) {
                this.form.patchValue({ academic_year_id: currentYear.id });
            }
        } else {
            this.selectedId = structure.id;
            this.form.patchValue({
                academic_year_id: structure.academic_year_id,
                fee_head_name: structure.fee_head_name,
                amount: structure.amount,
                period: structure.period,
                classes: structure.classes?.map(c => c.id) || []
            });
        }
        this.drawer.open();
    }

    closeDrawer() {
        this.drawer.close();
    }

    save() {
        if (this.form.invalid) return;
        this.isSaving = true;

        const request = this.selectedId
            ? this._apiService.updateFeeStructure(this.selectedId, this.form.value)
            : this._apiService.createFeeStructure(this.form.value);

        request.subscribe({
            next: () => {
                this._snackBar.open(`Fee structure ${this.selectedId ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
                this.isSaving = false;
                this.closeDrawer();
                this.loadStructures();
            },
            error: () => {
                this.isSaving = false;
                this._snackBar.open('Error saving fee structure', 'Close', { duration: 3000 });
            }
        });
    }

    deleteStructure(structure: any) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Fee Structure',
            message: `Are you sure you want to delete ${structure.fee_head_name}? This might affect future invoice generation for linked classes.`,
            actions: {
                confirm: {
                    label: 'Delete',
                    color: 'warn'
                }
            }
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                // Assuming deleteFeeStructure exists in ApiService, adding it just in case
                this._apiService.deleteFeeStructure(structure.id).subscribe({
                    next: () => {
                        this._snackBar.open('Fee structure deleted successfully', 'Close', { duration: 3000 });
                        this.loadStructures();
                    },
                    error: () => this._snackBar.open('Error deleting fee structure', 'Close', { duration: 3000 })
                });
            }
        });
    }
}
