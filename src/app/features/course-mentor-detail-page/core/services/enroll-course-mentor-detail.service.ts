import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { EnrollCourseMentorDetail } from '../models/enroll-course-mentor-detail.model';

@Injectable({
  providedIn: 'root',
})
export class EnrollCourseMentorDetailService {
  constructor(private httpClient: HttpClient) {}

  getOfflineEnrolledCourseById(course_mentor_id: string): Observable<Response<EnrollCourseMentorDetail>> {
    return this.httpClient.get<Response<EnrollCourseMentorDetail>>(`${environment.baseUrl}/api/students/offline-enrolled-courses/${course_mentor_id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
