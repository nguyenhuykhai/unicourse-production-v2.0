import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Blog, Filter, PayloadData, Response, Comment, BlogPayload } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private httpClient: HttpClient) {}

  getBlogs(body: Filter): Observable<Response<PayloadData<Blog>>> {
    return this.httpClient
      .post<Response<PayloadData<Blog>>>(
        `${environment.baseUrl}/api/blogs`, body
      )
      .pipe(catchError(this.handleError));
  }

  getBlogById(id: string): Observable<Response<Blog>> {
    return this.httpClient
      .get<Response<Blog>>(`${environment.baseUrl}/api/blogs/${id}`)
      .pipe(catchError(this.handleError));
  }

  getBlogLikes(id: string): Observable<Response<any>> {
    return this.httpClient
      .get<Response<any>>(`${environment.baseUrl}/api/blogs/${id}/likes`)
      .pipe(catchError(this.handleError));
  }

  getUserLikedBlog(id: string): Observable<Response<any>> {
    return this.httpClient
      .get<Response<any>>(`${environment.baseUrl}/api/blogs/${id}/likes/user-liked`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  getBlogComments(id: string): Observable<Response<Array<Comment>>> {
    return this.httpClient
      .get<Response<Array<Comment>>>(`${environment.baseUrl}/api/blogs/${id}/comments`)
      .pipe(catchError(this.handleError));
  }

  postComment(id: string, body: { content: string }): Observable<Response<Comment>> {
    return this.httpClient
      .post<Response<Comment>>(`${environment.baseUrl}/api/blogs/${id}/comments`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  postLike(id: string): Observable<Response<boolean>> {
    return this.httpClient
      .post<Response<boolean>>(`${environment.baseUrl}/api/blogs/${id}/likes`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  updateComment(blogId: string, commentId: string, body: { content: string }): Observable<Response<boolean>> {
    return this.httpClient
      .put<Response<boolean>>(`${environment.baseUrl}/api/blogs/${blogId}/comments/${commentId}`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
  }

  deleteComment(blogId: string, commentId: string): Observable<Response<boolean>> {
    return this.httpClient
      .delete<Response<boolean>>(`${environment.baseUrl}/api/blogs/${blogId}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  postBlog(body: BlogPayload): Observable<Response<Blog>> {
    return this.httpClient
      .post<Response<Blog>>(`${environment.baseUrl}/api/blogs/post-blog`, body, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
