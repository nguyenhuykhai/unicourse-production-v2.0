import { Injectable, Optional } from '@angular/core';
import { BodyUpdateUser, EnrollCourse, RequestUpdatePassword, Response, Student, User, Wallet } from '../models';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getProfile(): Observable<Response<User>> {
    return this.customHttp
      .get<Response<User>>(`${environment.baseUrl}/api/users/details`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateUserProfile(body: BodyUpdateUser): Observable<any> {
    return this.customHttp
      .put<any>(`${environment.baseUrl}/api/users`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  changePassword(body: RequestUpdatePassword): Observable<Response<boolean>> {
    return this.customHttp
      .post<Response<boolean>>(`${environment.baseUrl}/api/users/change-password`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getStudentProfile(): Observable<Response<Student>> {
    return this.customHttp
      .get<Response<Student>>(`${environment.baseUrl}/api/students/details`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getUnAuthUserProfile(userId: string): Observable<Response<User>> {
    return this.customHttp
      .get<Response<User>>(`${environment.baseUrl}/api/users/preview/${userId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getEnrolledCourses(): Observable<Response<EnrollCourse[]>> {
    return this.customHttp
      .get<Response<EnrollCourse[]>>(`${environment.baseUrl}/api/users/enrolledcourse`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getWallet(): Observable<Response<Wallet>> {
    return this.customHttp
      .get<Response<Wallet>>(`${environment.baseUrl}/api/users/wallet`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: any) {
    if (this.errorHandlingService) {
      const status = error?.status;
      const code = error?.error?.code;
      const message = error?.error?.message || 'An unknown error occurred';
      
      this.errorHandlingService.logError(status, code, message);
    } else {
      console.warn('ErrorHandlingService is not available');
    }
    return throwError(() => new Error(error));
  }
}
