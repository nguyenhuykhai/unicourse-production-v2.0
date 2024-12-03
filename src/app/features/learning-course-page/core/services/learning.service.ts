import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getLearningProgress(course_mentor_id: string): Observable<Response<any>> {
    return this.customHttp
      .get<Response<any>>(`${environment.baseUrl}/api/students/${course_mentor_id}/learningProgress`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  amendLearningProgress(body: any): Observable<Response<any>> {
    return this.customHttp
      .put<Response<any>>(`${environment.baseUrl}/api/students/amend/learningProgress`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  markedCompleteLearningProgress(
    enrollCourseId: string
  ): Observable<Response<any>> {
    return this.customHttp
      .post<Response<any>>(
        `${environment.baseUrl}/api/students/marked-complete-learning-progress`,
        {
          enrollCourseId,
        }
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
