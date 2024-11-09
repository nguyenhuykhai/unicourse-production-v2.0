import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Wishlist } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  constructor(private httpClient: HttpClient) {}

  getMyWishList(): Observable<Response<Wishlist[]>> {
    return this.httpClient
      .get<Response<any>>(`${environment.baseUrl}/api/students/wishlist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  addCourseToWishList(course_mentor_id: string): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(
        `${environment.baseUrl}/api/students/wishlist`,
        {
          courseMentorId: course_mentor_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          }
        }
      )
      .pipe(catchError(this.handleError));
  }

  removeCourseOutWishList(
    wishlist_id: string,
    course_mentor_id: string
  ): Observable<Response<any>> {
    const UserInfo = localStorage.getItem('UserInfo');
    const user = UserInfo ? JSON.parse(UserInfo) : 0;
    return this.httpClient
      .delete<Response<any>>(
        `${environment.baseUrl}/api/students/wishlist/${wishlist_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: {
            courseMentorId: course_mentor_id,
          }
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
