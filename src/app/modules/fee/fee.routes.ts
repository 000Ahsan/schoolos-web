import { Routes } from '@angular/router';
import { FeeStructureListComponent } from './structures/list/fee-structure-list.component';
import { InvoiceListComponent } from './invoices/list/invoice-list.component';
import { InvoiceDetailComponent } from './invoices/detail/invoice-detail.component';
import { DefaulterListComponent } from './defaulters/list/defaulter-list.component';
import { PaymentListComponent } from './payments/list/payment-list.component';

export default [
    { path: '', redirectTo: 'structures', pathMatch: 'full' },
    { path: 'structures', component: FeeStructureListComponent },
    { path: 'invoices', component: InvoiceListComponent },
    { path: 'invoices/:id', component: InvoiceDetailComponent },
    { path: 'defaulters', component: DefaulterListComponent },
    { path: 'payments', component: PaymentListComponent },
] as Routes;
