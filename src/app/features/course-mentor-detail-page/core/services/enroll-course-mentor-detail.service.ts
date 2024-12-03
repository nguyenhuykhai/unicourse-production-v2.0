import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { EnrollCourseMentorDetail } from '../models/enroll-course-mentor-detail.model';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class EnrollCourseMentorDetailService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getOfflineEnrolledCourseById(course_mentor_id: string): Observable<Response<EnrollCourseMentorDetail>> {
    return this.customHttp.get<Response<EnrollCourseMentorDetail>>(`${environment.baseUrl}/api/students/offline-enrolled-courses/${course_mentor_id}`
    ).pipe(
      catchError(this.handleError)
    );
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
