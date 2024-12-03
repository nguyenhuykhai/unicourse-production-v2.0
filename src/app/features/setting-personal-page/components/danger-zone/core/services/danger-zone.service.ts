import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';
import { Response } from '../../../../../../common/models';
import { ConfirmOTP } from '../models';
import { ErrorHandlingService } from '../../../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class DangerZoneService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  postInitiateAccountClosure(): Observable<Response<boolean>> {
    return this.customHttp
      .post<Response<boolean>>(
        `${environment.baseUrl}/api/users/initiate-account-closure`,
        {}
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  postCompleteAccountClosure(body: ConfirmOTP): Observable<Response<boolean>> {
    return this.customHttp
      .post<Response<boolean>>(
        `${environment.baseUrl}/api/users/complete-account-closure`,
        body
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
