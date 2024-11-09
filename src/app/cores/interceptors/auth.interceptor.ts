import { HttpInterceptorFn } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { AuthService } from '../../shared/layouts/default-layout/sign-in-form-dialog/core/services/auth.service';
import { inject } from '@angular/core';
import { Response } from '../../common/models';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  let token = localStorage.getItem('accessToken');

  if (token) {
    try {
      const decodedToken: any = jwt_decode.jwtDecode(token);
      // Kiểm tra xem token đã hết hạn chưa
      if (decodedToken.exp * 1000 < Date.now()) {
        // Nếu token đã hết hạn, refresh token
        // return from(refreshToken(authService)).pipe(
        //   switchMap(() => {
        //     token = localStorage.getItem('accessToken');
        //     if (token) {
        //       const authReq = req.clone({
        //         setHeaders: {
        //           Authorization: `Bearer ${token}`,
        //         },
        //       });
        //       return next(authReq);
        //     } else {
        //       console.error('Token refresh failed, no token available');
        //       return next(req);
        //     }
        //   }),
        //   catchError((error) => {
        //     console.error('Error refreshing token', error);
        //     localStorage.clear();
        //     authService.doLogout(); // Đăng xuất người dùng
        //     return throwError(error);
        //   })
        // );

        localStorage.clear();
        authService.doLogout(); // Đăng xuất người dùng
        window.location.reload();
        return next(req);
      }

      // Nếu token chưa hết hạn, thêm token vào header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    } catch (error) {
      console.error('Error decoding token', error);
      localStorage.clear();
      authService.doLogout();
      window.location.reload();
      return next(req);
    }
  }

  localStorage.clear();
  authService.doLogout();
  return next(req);
};

function refreshToken(authService: AuthService): Observable<void> {
  return new Observable<void>((observer) => {
    authService.refreshToken().subscribe(
      (res: Response<any>) => {
        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          observer.next();
          observer.complete();
        } else {
          authService.doLogout();
          localStorage.clear();
          observer.error(new Error('Refresh token is invalid'));
        }
      },
      (error) => {
        console.error('Refresh token error', error);
        localStorage.clear();
        authService.doLogout();
        observer.error(error);
      }
    );
  });
}