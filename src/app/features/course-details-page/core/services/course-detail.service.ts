import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class CourseDetailService {
  constructor(private httpClient: HttpClient) {}

  getCourseById(courseId: string): Observable<Response<Course>> {
    return this.httpClient
      .get<Response<Course>>(`${environment.baseUrl}/api/courses/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  getFeedbackByCourseId(
    courseId: string
  ): Observable<Response<Array<Feedbacks>>> {
    return this.httpClient
      .get<Response<any>>(
        `${environment.baseUrl}/api/courses/${courseId}/course-mentors/feedbacks`
      )
      .pipe(catchError(this.handleError));
  }

  getLectureInfoByLectureId(lectureId: string): Observable<Response<Lecturer>> {
    return this.httpClient
      .get<Response<Lecturer>>(
        `${environment.baseUrl}/api/lecturers/${lectureId}`
      )
      .pipe(catchError(this.handleError));
  }

  enrollCourse(course_mentor_id: string): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(
        `${environment.baseUrl}/api/courses/enrollCourse`,
        {
          mentor_course_id: course_mentor_id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  getEnrollIdsList(): Observable<Response<any>> {
    return this.httpClient
      .get<Response<any>>(
        `${environment.baseUrl}/api/users/enrolledcourse/retrieve-id`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
