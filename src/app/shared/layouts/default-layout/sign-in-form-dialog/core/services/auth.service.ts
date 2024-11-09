import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Response } from '../../../../../../common/models';
import { SocketService } from '../../../../../../common/services/socket.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    public afAuth: AngularFireAuth,
    private httpClient: HttpClient
  ) {}

  // Đăng nhập bằng tài khoản google
  doGoogleLogin() {
    return this.authLogin(new GoogleAuthProvider());
  }

  doLogout() {
    // Đăng xuất khỏi firebase
    return this.afAuth.signOut();
  }

  private authLogin(provider: any): any {
    return this.afAuth
      .signInWithPopup(provider)
      .then(() => {
      })
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
  signIn(
    id_token: string,
  ): Observable<any> {
    const body = { id_token };
    return this.httpClient.post(`${environment.baseUrl}/api/auth/token-signin`, body);
  }

  login(email: string, password: string): Observable<Response<any>> {
    const body = { email, password };
    return this.httpClient.post<Response<any>>(`${environment.baseUrl}/api/auth/login`, body);
  }

  // Call API kiểm tra xem user đã đăng ký khóa học chưa
  checkUserRegisterCourse(userId: string, courseId: string): Observable<any> {
    const body = { userId, courseId };
    return this.httpClient
      .post(`${environment.baseUrl}/api/user/checkUserRegisterCourse`, body)
      .pipe(catchError(this.handleError));
  }

  // Call API refresh token: /api/auth/refresh-token
  refreshToken(): Observable<Response<any>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const body = { refreshToken };
    return this.httpClient.post<Response<any>>(`${environment.baseUrl}/api/auth/refresh-token`, body);
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
