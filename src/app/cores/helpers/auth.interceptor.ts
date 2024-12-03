import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import * as jwt_decode from 'jwt-decode';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../shared/layouts/default-layout/sign-in-form-dialog/core/services';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private isRefreshing = false; // Indicates if a refresh token call is in progress
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return of(this.router.createUrlTree(['/']));
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        // Handle token refresh if expired
        return this.handleTokenRefresh().pipe(
          switchMap((newToken) => {
            if (newToken) {
              // Token refresh successful, proceed to the requested route
              return of(true);
            } else {
              // If refresh failed, redirect to login
              return of(this.router.createUrlTree(['/']));
            }
          })
        );
      }

      // If token is valid, allow access
      return of(true);
    } else {
      // If not running in the browser, redirect to login
      return of(this.router.createUrlTree(['/']));
    }
  }

  private handleTokenRefresh(): Observable<string | null> {
    if (!this.isRefreshing) {
      // Start the refresh process if not already in progress
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Reset the subject

      return this.authService.refreshToken().pipe(
        map((res: any) => {
          const newAccessToken = res && res.data.accessToken.split(' ')[1];
          const newRefreshToken = res && res.data.refreshToken.split(' ')[1];
          
          // Save new tokens
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          this.isRefreshing = false;
          this.refreshTokenSubject.next(newAccessToken); // Notify all waiting subscribers with the new token
          return newAccessToken;
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null); // Notify subscribers that refresh failed
          localStorage.clear();
          window.location.reload();
          return of(null);
        })
      );
    } else {
      // If refresh is already in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null), // Wait until the new token is available
        take(1) // Complete after getting the new token
      );
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwt_decode.jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token', error);
      return true; // Treat as expired if decoding fails
    }
  }
}