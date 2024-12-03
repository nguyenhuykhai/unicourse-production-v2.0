import { Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Blog, Filter, PayloadData, Response, Comment, BlogPayload } from '../models';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getBlogs(body: Filter): Observable<Response<PayloadData<Blog>>> {
    return this.customHttp
      .post<Response<PayloadData<Blog>>>(
        `${environment.baseUrl}/api/blogs`,
        body
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  getBlogById(id: string): Observable<Response<Blog>> {
    return this.customHttp
      .get<Response<Blog>>(`${environment.baseUrl}/api/blogs/${id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getBlogLikes(id: string): Observable<Response<any>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/blogs/${id}/likes`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getUserLikedBlog(id: string): Observable<Response<any>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/blogs/${id}/likes/user-liked`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getBlogComments(id: string): Observable<Response<Array<Comment>>> {
    return this.customHttp.get<Response<Array<Comment>>>(`${environment.baseUrl}/api/blogs/${id}/comments`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  postComment(
    id: string,
    body: { content: string }
  ): Observable<Response<Comment>> {
    return this.customHttp
      .post<Response<Comment>>(`${environment.baseUrl}/api/blogs/${id}/comments`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  postLike(id: string): Observable<Response<boolean>> {
    return this.customHttp
      .post<Response<boolean>>(`${environment.baseUrl}/api/blogs/${id}/likes`,{})
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateComment(
    blogId: string,
    commentId: string,
    body: { content: string }
  ): Observable<Response<boolean>> {
    return this.customHttp.put<Response<boolean>>(
      `${environment.baseUrl}/api/blogs/${blogId}/comments/${commentId}`, body);
  }

  deleteComment(
    blogId: string,
    commentId: string
  ): Observable<Response<boolean>> {
    return this.customHttp
      .delete<Response<boolean>>(`${environment.baseUrl}/api/blogs/${blogId}/comments/${commentId}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  postBlog(body: BlogPayload): Observable<Response<Blog>> {
    return this.customHttp
      .post<Response<Blog>>(`${environment.baseUrl}/api/blogs/post-blog`, body)
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
