import { Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Wishlist } from '../models';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getMyWishList(): Observable<Response<Wishlist[]>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/students/wishlist`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  addCourseToWishList(course_mentor_id: string): Observable<Response<any>> {
    return this.customHttp
      .post<Response<any>>(
        `${environment.baseUrl}/api/students/wishlist`,
        {
          courseMentorId: course_mentor_id,
        }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  removeCourseOutWishList(wishlist_id: string, course_mentor_id: string): Observable<Response<any>> {
    const customHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
  
    return this.customHttp
      .delete<Response<any>>(
        `${environment.baseUrl}/api/students/wishlist/${wishlist_id}`,
        customHeaders,
        { courseMentorId: course_mentor_id } // Pass the body as the third argument
      )
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
