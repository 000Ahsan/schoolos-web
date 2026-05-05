import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { StudentAuthService } from 'app/core/auth/student-auth.service';
import { of, switchMap } from 'rxjs';

export const NoStudentGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);

    return inject(StudentAuthService).check().pipe(
        switchMap((authenticated) => {
            if (authenticated) {
                return of(router.parseUrl('/student/dashboard'));
            }

            return of(true);
        })
    );
};
