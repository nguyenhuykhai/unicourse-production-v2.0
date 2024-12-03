import { Injectable, NgZone, Optional } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { Observable, catchError, from, switchMap, tap, throwError } from 'rxjs';
import { Response } from '../../../../../../common/models';
import { Helpers } from '../../../../../../cores/utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    public afAuth: AngularFireAuth,
    private httpClient: HttpClient,
    private ngZone: NgZone
  ) {}

  // Đăng nhập bằng tài khoản google
  doGoogleLogin() {
    return this.authLogin(new GoogleAuthProvider());
  }

  doLogout(): Observable<void> {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      return from(this.afAuth.signOut());
    }
  
    if (Helpers.isTokenExpired(token)) {
      // If token is expired, refresh the token
      return this.refreshToken().pipe(
        switchMap((res) => {
          const { accessToken } = Helpers.getAccessTokenAndRefreshToken(res);
          // Once token is refreshed, call logoutFromServer
          return this.logoutFromServer(accessToken).pipe(
            switchMap(() => from(this.afAuth.signOut()))
          );
        }),
        catchError((error) => {
          console.error('Error refreshing token', error);
          // Call logoutFromServer even if refreshing token fails
          return this.logoutFromServer(token).pipe(
            switchMap(() => from(this.afAuth.signOut()))
          );
        })
      );
    } else {
      // Directly call logoutFromServer if token is not expired or doesn't exist
      return this.logoutFromServer(token).pipe(
        switchMap(() => from(this.afAuth.signOut()))
      );
    }
  }

  logoutFromServer(accessToken: string): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(`${environment.baseUrl}/api/auth/logout`, {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        }
      )
      .pipe((catchError((error) => this.handleError(error))));
  }
  

  private authLogin(provider: any): any {
    return this.afAuth
      .signInWithPopup(provider)
      .then(() => {})
      .catch((error) => {
        console.log(error);
      });
  }

  checkLogin(): Promise<User> {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.onAuthStateChanged(function (user) {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  // Call API Login
  signIn(id_token: string): Observable<any> {
    const body = { id_token };
    return this.httpClient.post(
      `${environment.baseUrl}/api/auth/token-signin`,
      body
    );
  }

  login(email: string, password: string): Observable<Response<any>> {
    const body = { email, password };
    return this.httpClient.post<Response<any>>(
      `${environment.baseUrl}/api/auth/login`,
      body
    );
  }

  // Call API kiểm tra xem user đã đăng ký khóa học chưa
  checkUserRegisterCourse(userId: string, courseId: string): Observable<any> {
    const body = { userId, courseId };
    return this.httpClient
      .post(`${environment.baseUrl}/api/user/checkUserRegisterCourse`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Call API refresh token: /api/auth/refresh-token
  refreshToken(): Observable<Response<any>> {
    const BearerToken = `Bearer ${localStorage.getItem('refreshToken')}`;
    const body = { refresh_token: BearerToken };

    return this.ngZone.run(() => {
      return this.httpClient
        .post<Response<any>>(
          `${environment.baseUrl}/api/auth/refresh-token`,
          body
        )
        .pipe(catchError((error) => this.handleError(error)));
    });
  }

  private handleError(error: any) {
    const code = error?.error?.code;
    if (code === 'UNC019' || code === 'UNC002') {
      Helpers.clearLocalStorageAndRedirectAndReload();
    }
    return throwError(() => new Error(error));
  }
}
