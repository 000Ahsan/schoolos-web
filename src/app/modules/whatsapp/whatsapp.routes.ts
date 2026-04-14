import { Routes } from '@angular/router';
import { WhatsappListComponent } from './list/whatsapp-list.component';

export default [
    { path: '', redirectTo: 'logs', pathMatch: 'full' },
    { path: 'logs', component: WhatsappListComponent }
] as Routes;
