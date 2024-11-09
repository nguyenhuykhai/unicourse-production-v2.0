import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BodyUpdateUser, EnrollCourse, RequestUpdatePassword, Response, Student, User, Wallet } from '../models';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {}

  getProfile(): Observable<Response<User>> {
    return this.httpClient
      .get<Response<User>>(`${environment.baseUrl}/api/users/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  updateUserProfile(body: BodyUpdateUser): Observable<any> {
    return this.httpClient
      .put<any>(`${environment.baseUrl}/api/users`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  changePassword(body: RequestUpdatePassword): Observable<Response<boolean>> {
    return this.httpClient
      .post<Response<boolean>>(`${environment.baseUrl}/api/users/change-password`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  getStudentProfile(): Observable<Response<Student>> {
    return this.httpClient
      .get<Response<Student>>(`${environment.baseUrl}/api/students/details`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  getUnAuthUserProfile(userId: string): Observable<Response<User>> {
    return this.httpClient
      .get<Response<User>>(`${environment.baseUrl}/api/users/preview/${userId}`)
      .pipe(catchError(this.handleError));
  }

  getEnrolledCourses(): Observable<Response<EnrollCourse[]>> {
    return this.httpClient
      .get<Response<EnrollCourse[]>>(
        `${environment.baseUrl}/api/users/enrolledcourse`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  getWallet(): Observable<Response<Wallet>> {
    return this.httpClient
      .get<Response<Wallet>>(`${environment.baseUrl}/api/users/wallet`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
