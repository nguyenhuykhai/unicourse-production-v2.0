import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private httpClient: HttpClient) {}

  getLearningProgress(course_mentor_id: string): Observable<Response<any>> {
    return this.httpClient
      .get<Response<any>>(
        `${environment.baseUrl}/api/students/${course_mentor_id}/learningProgress`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  amendLearningProgress(body: any): Observable<Response<any>> {
    return this.httpClient
      .put<Response<any>>(
        `${environment.baseUrl}/api/students/amend/learningProgress`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  markedCompleteLearningProgress(
    enrollCourseId: string
  ): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(
        `${environment.baseUrl}/api/students/marked-complete-learning-progress`,
        {
          enrollCourseId,
        },
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
