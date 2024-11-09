import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Feedback, FeedBackCourseMentorResponse, FeedbackIssueObject, Response } from '../models';
import { environment } from '../../../environments/environment';
import { FeedbackObject } from '../../features/transaction-history-page/transaction-list/core/models';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private httpClient: HttpClient) {}

  getAllHighLightFeedback(): Observable<Response<Feedback>> {
    return this.httpClient
      .get<Response<Feedback>>(
        `${environment.baseUrl}/api/feedbacks/highlight`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  postFeedback(content: string, rating: number, course_enroll_id: string): Observable<Response<FeedBackCourseMentorResponse>> {
    return this.httpClient
      .post<Response<FeedBackCourseMentorResponse>>(`${environment.baseUrl}/api/feedbacks`, 
      {
        content,
        rating,
        course_enroll_id,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  postFeedbackIssue(body: FeedbackIssueObject): Observable<Response<boolean>> {
    return this.httpClient
      .post<Response<boolean>>(`${environment.baseUrl}/api/feedbacks/send`, body, {
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
