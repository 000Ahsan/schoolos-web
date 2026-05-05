import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentAuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('student_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('student_token') ?? '';
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { username: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('Student is already logged in.');
        }

        return this._httpClient.post(environment.apiUrl + '/student/login', credentials).pipe(
            switchMap((response: any) => {
                this.accessToken = response.access_token;
                this._authenticated = true;
                localStorage.setItem('student_user', JSON.stringify(response.student));
                return of(response);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        localStorage.removeItem('student_token');
        localStorage.removeItem('student_user');
        this._authenticated = false;

        return this._httpClient.post(environment.apiUrl + '/student/auth/logout', {}).pipe(
            catchError(() => of(true)),
            switchMap(() => of(true))
        );
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        if (!this.accessToken) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        return this.signInUsingToken();
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        return this._httpClient.get(environment.apiUrl + '/student/auth/me').pipe(
            catchError(() => of(false)),
            switchMap((response: any) => {
                if (!response) {
                    return of(false);
                }
                this._authenticated = true;
                localStorage.setItem('student_user', JSON.stringify(response));
                return of(true);
            })
        );
    }
}
