import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Filter, Response } from '../../../../common/models';
import { PayLoadTransactionHistory } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TransactionHistoryService {
  constructor(private httpClient: HttpClient) {}

  getTransactionHistory(
    body: Filter
  ): Observable<Response<PayLoadTransactionHistory>> {
    return this.httpClient
      .post<Response<PayLoadTransactionHistory>>(
        `${environment.baseUrl}/api/transactions/`,
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
