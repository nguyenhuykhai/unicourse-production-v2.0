import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {
  Feedback,
  FeedBackCourseMentorResponse,
  FeedbackIssueObject,
  Response,
} from '../models';
import { environment } from '../../../environments/environment';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getAllHighLightFeedback(): Observable<Response<Feedback>> {
    return this.customHttp
      .get<Response<Feedback>>(`${environment.baseUrl}/api/feedbacks/highlight`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  postFeedback(
    content: string,
    rating: number,
    course_enroll_id: string
  ): Observable<Response<FeedBackCourseMentorResponse>> {
    return this.customHttp
      .post<Response<FeedBackCourseMentorResponse>>(
        `${environment.baseUrl}/api/feedbacks`,
        {
          content,
          rating,
          course_enroll_id,
        }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  postFeedbackIssue(body: FeedbackIssueObject): Observable<Response<boolean>> {
    return this.customHttp
      .post<Response<boolean>>(
        `${environment.baseUrl}/api/feedbacks/send`,
        body
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
