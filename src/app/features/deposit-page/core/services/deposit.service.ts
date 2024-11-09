import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Filter, PayloadData, Response } from '../../../../common/models';
import { Deposit } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  constructor(private httpClient: HttpClient) {}

  getDeposit(body: Filter): Observable<Response<PayloadData<Deposit>>> {
    return this.httpClient
      .post<Response<PayloadData<Deposit>>>(
        `${environment.baseUrl}/api/students/deposits`,
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
