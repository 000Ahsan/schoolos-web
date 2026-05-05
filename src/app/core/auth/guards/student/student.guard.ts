import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { StudentAuthService } from 'app/core/auth/student-auth.service';
import { of, switchMap } from 'rxjs';

export const StudentGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);

    return inject(StudentAuthService).check().pipe(
        switchMap((authenticated) => {
            if (!authenticated) {
                const redirectURL = state.url === '/student/sign-out' ? '' : `redirectURL=${state.url}`;
                const url = `/student/login${redirectURL ? '?' + redirectURL : ''}`;

                return of(router.parseUrl(url));
            }

            return of(true);
        })
    );
};
