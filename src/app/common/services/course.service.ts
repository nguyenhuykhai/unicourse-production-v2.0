import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CourseFilterResponse, CourseMentor, Filter, Response } from '../models';
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private httpClient: HttpClient) {}
  
  getCourse(): Observable<Response<CourseMentor[]>> {
    return this.httpClient.post<Response<CourseMentor[]>>(`${environment.baseUrl}/api/courses`,{}
    ).pipe(
      catchError(this.handleError)
    );
  }

  getCourseFilter(body: Filter): Observable<Response<CourseFilterResponse>> {
    return this.httpClient.post<Response<CourseFilterResponse>>(`${environment.baseUrl}/api/courses`, body).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
