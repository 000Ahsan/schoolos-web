import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
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
                if (error.status === 401 && !req.url.includes('auth/login')) {
                    authService.signOut().subscribe(() => {
                        snackBar.open('Session expired. Please sign in again.', 'Close', { duration: 3000 });
                        location.reload();
                    });
                } else if (error.status === 422) {
                    // Handled mostly inside form logic, but we can intercept anyway.
                    // Angular forms typically handle 422 locally by parsing response error.
                } else if (error.status === 404) {
                    snackBar.open('Resource not found.', 'Close', { duration: 3000, panelClass: ['fuse-alert', 'fuse-alert-warn'] });
                } else if (error.status === 500) {
                    snackBar.open('A server error occurred. Please try again or contact support.', 'Retry', { duration: 5000, panelClass: ['fuse-alert', 'fuse-alert-warn'] });
                } else if (error.status === 0) {
                    snackBar.open('Cannot connect to server. Check your internet connection.', 'Close', { duration: 5000, panelClass: ['fuse-alert', 'fuse-alert-warn'] });
                }
            }

            return throwError(() => error);
        })
    );
};
