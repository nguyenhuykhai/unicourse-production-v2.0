import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CourseMentor, CourseMentorDetail, Response } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CourseMentorService {
  constructor(private httpClient: HttpClient) {}
  
  getCourse(): Observable<Response<CourseMentor[]>> {
    return this.httpClient.post<Response<CourseMentor[]>>(`${environment.baseUrl}/api/courses`,{}
    ).pipe(
      catchError(this.handleError)
    );
  }

  getCourseMentorById(course_id: string, course_mentor_id: string): Observable<Response<CourseMentorDetail>> {
    return this.httpClient.get<Response<CourseMentorDetail>>(`${environment.baseUrl}/api/courses/${course_id}/course-mentors/${course_mentor_id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
