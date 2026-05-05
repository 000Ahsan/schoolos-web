import { Route } from '@angular/router';
import { StudentPortalLoginComponent } from 'app/modules/student-portal/login/login.component';
import { StudentPortalDashboardComponent } from 'app/modules/student-portal/dashboard/dashboard.component';
import { StudentPortalVouchersComponent } from 'app/modules/student-portal/vouchers/vouchers.component';
import { StudentPortalPaymentsComponent } from 'app/modules/student-portal/payments/payments.component';
import { NoStudentGuard } from 'app/core/auth/guards/student/noStudent.guard';
import { StudentGuard } from 'app/core/auth/guards/student/student.guard';
import { StudentLayoutComponent } from 'app/modules/student-portal/student-layout/student-layout.component';

export const studentPortalRoutes: Route[] = [
    {
        path: 'login',
        canActivate: [NoStudentGuard],
        component: StudentPortalLoginComponent
    },
    {
        path: '',
        canActivate: [StudentGuard],
        component: StudentLayoutComponent,
        children: [
            {
                path: 'dashboard',
                component: StudentPortalDashboardComponent
            },
            {
                path: 'vouchers',
                component: StudentPortalVouchersComponent
            },
            {
                path: 'payments',
                component: StudentPortalPaymentsComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];
