import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../../../common/models';
import { LecturerProfile } from '../models';
import { environment } from '../../../../../environments/environment';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class LecturerProfileService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getLecturerById(id: number): Observable<Response<LecturerProfile>> {
    return this.customHttp
      .get<Response<LecturerProfile>>(
        `${environment.baseUrl}/api/lecturers/${id}`
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
