import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { TopicComment, TopicCommentRequest } from '../models';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class TopicCommentService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getComments(topic_id: string): Observable<Response<Array<TopicComment>>> {
    return this.customHttp
      .get<Response<Array<TopicComment>>>(`${environment.baseUrl}/api/topicComments/topic/${topic_id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getReplies(comment_id: string): Observable<Response<any>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/topicComments/replies/${comment_id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  addTopicComment(data: TopicCommentRequest): Observable<Response<TopicComment>> {
    return this.customHttp
      .post<Response<TopicComment>>(`${environment.baseUrl}/api/topicComments/`, data)
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteParentComment(comment_id: string): Observable<Response<boolean>> {
    return this.customHttp
      .delete<Response<boolean>>(`${environment.baseUrl}/api/topicComments/${comment_id}/parent`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteReplyComment(comment_id: string): Observable<Response<boolean>> {
    return this.customHttp
      .delete<Response<boolean>>(`${environment.baseUrl}/api/topicComments/${comment_id}/reply`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateComment(content: string, comment_id: string): Observable<Response<TopicComment>> {
    return this.customHttp
      .put<Response<TopicComment>>(
        `${environment.baseUrl}/api/topicComments`,
        { content, id: comment_id }
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
