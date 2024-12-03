import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  Course,
  Lecturer,
  Response,
  Wishlist,
} from '../../../../common/models';
import { Feedbacks } from '../models';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class CourseDetailService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getCourseById(courseId: string): Observable<Response<Course>> {
    return this.customHttp
      .get<Response<Course>>(`${environment.baseUrl}/api/courses/${courseId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getFeedbackByCourseId(
    courseId: string
  ): Observable<Response<Array<Feedbacks>>> {
    return this.customHttp
      .get<Response<any>>(
        `${environment.baseUrl}/api/courses/${courseId}/course-mentors/feedbacks`
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  getLectureInfoByLectureId(lectureId: string): Observable<Response<Lecturer>> {
    return this.customHttp
      .get<Response<Lecturer>>(
        `${environment.baseUrl}/api/lecturers/${lectureId}`
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  enrollCourse(course_mentor_id: string): Observable<Response<any>> {
    return this.customHttp
      .post<Response<any>>(
        `${environment.baseUrl}/api/courses/enrollCourse`,
        {
          mentor_course_id: course_mentor_id
        }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  getEnrollIdsList(): Observable<Response<any>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/users/enrolledcourse/retrieve-id`)
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
