import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { environment } from 'environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    // Clone the request object
    let newReq = req.clone();

    // Determine which token to use by accessing localStorage directly
    // to avoid circular dependencies with AuthService/StudentAuthService
    let token = '';
    const isStudentPortal = req.url.startsWith(`${environment.apiUrl}/student/`);
    
    if (isStudentPortal) {
        token = localStorage.getItem('student_token') ?? '';
    } else {
        token = localStorage.getItem('schoolos_token') ?? '';
    }

    // Add Authorization header if token exists and is valid
    if (token && !AuthUtils.isTokenExpired(token)) {
        newReq = req.clone({
            headers: req.headers.set(
                'Authorization',
                'Bearer ' + token
            ),
        });
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" responses
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !req.url.includes('auth/login') &&
                !req.url.includes('student/login')
            ) {
                // Determine which token to remove
                const isStudentPortal = req.url.startsWith(`${environment.apiUrl}/student/`);
                
                if (isStudentPortal) {
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('student_user');
                } else {
                    localStorage.removeItem('schoolos_token');
                    localStorage.removeItem('schoolos_user');
                }

                // Reload the app
                location.reload();
            }

            return throwError(error);
        })
    );
};
