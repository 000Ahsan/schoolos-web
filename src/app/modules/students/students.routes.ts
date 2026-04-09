import { Routes } from '@angular/router';
import { StudentListComponent } from './list/student-list.component';
import { StudentFormComponent } from './form/student-form.component';

export default [
    {
        path: '',
        component: StudentListComponent,
    },
    {
        path: 'new',
        component: StudentFormComponent,
    },
    {
        path: ':id/edit',
        component: StudentFormComponent,
    }
] as Routes;
