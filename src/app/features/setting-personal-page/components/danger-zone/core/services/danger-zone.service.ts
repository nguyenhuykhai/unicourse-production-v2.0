import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';
import { Response } from '../../../../../../common/models';
import { ConfirmOTP } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DangerZoneService {
  constructor(private httpClient: HttpClient) {}

  postInitiateAccountClosure(): Observable<Response<boolean>> {
    return this.httpClient
      .post<Response<boolean>>(
        `${environment.baseUrl}/api/users/initiate-account-closure`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  postCompleteAccountClosure(body: ConfirmOTP): Observable<Response<boolean>> {
    return this.httpClient
      .post<Response<boolean>>(
        `${environment.baseUrl}/api/users/complete-account-closure`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
