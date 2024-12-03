import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import { AuthService } from '../../shared/layouts/default-layout/sign-in-form-dialog/core/services';
import { Helpers } from '../../cores/utils';

@Injectable({
  providedIn: 'root',
})
export class CustomHttpClientService {
  private isRefreshing = false; // Flag to track token refresh in progress
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get<T>(url: string, customHeaders?: HttpHeaders): Observable<T> {
    return this.handleToken().pipe(
      switchMap((token) => {
        const headers = this.mergeHeaders(token, customHeaders);
        return this.http.get<T>(url, { headers });
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  post<T>(url: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    return this.handleToken().pipe(
      switchMap((token) => {
        const headers = this.mergeHeaders(token, customHeaders);
        return this.http.post<T>(url, body, { headers });
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  put<T>(url: string, body: any, customHeaders?: HttpHeaders): Observable<T> {
    return this.handleToken().pipe(
      switchMap((token) => {
        const headers = this.mergeHeaders(token, customHeaders);
        return this.http.put<T>(url, body, { headers });
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  delete<T>(url: string, customHeaders?: HttpHeaders, body?: any): Observable<T> {
    return this.handleToken().pipe(
      switchMap((token) => {
        const headers = this.mergeHeaders(token, customHeaders);
        return this.http.request<T>('DELETE', url, { headers, body });
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleToken(): Observable<string | null> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return of(null); // No token, proceed without Authorization header
    }

    if (Helpers.isTokenExpired(token)) {
      return this.refreshToken(); // Refresh token if expired
    }

    return of(token); // Token is valid, return it
  }

  private refreshToken(): Observable<string | null> {
    if (this.isRefreshing) {
      // If a refresh is already in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null), // Wait until a new token is available
        take(1) // Complete after receiving the new token
      );
    }

    // Start a new refresh process
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null); // Reset the subject

    return this.authService.refreshToken().pipe(
      switchMap((res: any) => {
        const newToken = res.data.accessToken.split(' ')[1];
        localStorage.setItem('accessToken', newToken); // Save the new token
        const newRefreshToken = res.data.refreshToken.split(' ')[1];
        localStorage.setItem('refreshToken', newRefreshToken); // Save the refresh token

        this.isRefreshing = false;
        this.refreshTokenSubject.next(newToken); // Notify all waiting requests with the new token
        return of(newToken);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null); // Notify subscribers that refresh failed
        this.authService.doLogout(); // Logout if refresh fails
        return of(null); // Return null to skip adding Authorization header
      })
    );
  }

  private mergeHeaders(token: string | null, customHeaders?: HttpHeaders): HttpHeaders {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (customHeaders) {
      customHeaders.keys().forEach((key) => {
        headers = headers.set(key, customHeaders.get(key) || '');
      });
    }
    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Error:', error);
    return throwError(() => error);
  }
}