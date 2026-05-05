import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const snackBar = inject(MatSnackBar);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred.';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
                snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 3000 });
            } else {
                // Server-side error
                if (error.status === 401 && !req.url.includes('auth/login') && !req.url.includes('student/login')) {
                    // Handled by authInterceptor mainly, but we can clear storage here if needed
                    // to avoid circular dependency with AuthService
                    localStorage.removeItem('schoolos_token');
                    localStorage.removeItem('schoolos_user');
                    localStorage.removeItem('student_token');
                    localStorage.removeItem('student_user');
                    
                    snackBar.open('Session expired. Please sign in again.', 'Close', { duration: 3000 });
                    setTimeout(() => location.reload(), 1000);
                } else if (error.status === 422) {
                    // Validation errors are typically handled by components
                } else if (error.status === 404) {
                    snackBar.open('Resource not found.', 'Close', { duration: 3000 });
                } else if (error.status === 500) {
                    snackBar.open('A server error occurred. Please try again.', 'Close', { duration: 5000 });
                } else if (error.status === 0) {
                    snackBar.open('Cannot connect to server. Check your internet connection.', 'Close', { duration: 5000 });
                }
            }

            return throwError(() => error);
        })
    );
};
