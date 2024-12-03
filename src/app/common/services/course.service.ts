import { Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CourseFilterResponse, CourseMentor, Filter, Response } from '../models';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}
  
  getCourse(): Observable<Response<CourseMentor[]>> {
    return this.customHttp.post<Response<CourseMentor[]>>(`${environment.baseUrl}/api/courses`,{}
    ).pipe(
      catchError(this.handleError)
    );
  }

  getCourseFilter(body: Filter): Observable<Response<CourseFilterResponse>> {
    return this.customHttp.post<Response<CourseFilterResponse>>(`${environment.baseUrl}/api/courses`, body).pipe(
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
