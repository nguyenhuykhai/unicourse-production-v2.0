import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { TopicComment, TopicCommentRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TopicCommentService {
  constructor(private httpClient: HttpClient) {}

  getComments(topic_id: string): Observable<Response<Array<TopicComment>>> {
    return this.httpClient
      .get<Response<Array<TopicComment>>>(
        `${environment.baseUrl}/api/topicComments/topic/${topic_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  getReplies(comment_id: string): Observable<Response<any>> {
    return this.httpClient
      .get<Response<any>>(
        `${environment.baseUrl}/api/topicComments/replies/${comment_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  addTopicComment(data: TopicCommentRequest): Observable<Response<TopicComment>> {
    return this.httpClient
      .post<Response<TopicComment>>(
        `${environment.baseUrl}/api/topicComments/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteParentComment(comment_id: string): Observable<Response<boolean>> {
    return this.httpClient
      .delete<Response<boolean>>(
        `${environment.baseUrl}/api/topicComments/${comment_id}/parent`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteReplyComment(comment_id: string): Observable<Response<boolean>> {
    return this.httpClient
      .delete<Response<boolean>>(
        `${environment.baseUrl}/api/topicComments/${comment_id}/reply`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateComment(content: string, comment_id: string): Observable<Response<TopicComment>> {
    return this.httpClient
      .put<Response<TopicComment>>(
        `${environment.baseUrl}/api/topicComments`,
        { content, id: comment_id },
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
