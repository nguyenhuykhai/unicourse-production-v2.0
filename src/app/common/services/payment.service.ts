import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentLink, InfoPaymentLink, PaymentLink, Response } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private httpClient: HttpClient) {}

  createPayOSLink(body: CreatePaymentLink): Observable<Response<PaymentLink>> {
    return this.httpClient
      .post<Response<PaymentLink>>(
        `${environment.baseUrl}/api/payments/create-payment-link`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  cancelPaymentLink(orderCode: string): Observable<Response<InfoPaymentLink>> {
    return this.httpClient
      .post<Response<InfoPaymentLink>>(
        `${environment.baseUrl}/api/payments/cancel-payment-link/${orderCode}`,
        {
          cancellationReason: 'Người dùng hủy giao dịch',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  getPaymentLink(orderCode: string): Observable<Response<InfoPaymentLink>> {
    return this.httpClient
      .get<Response<InfoPaymentLink>>(
        `${environment.baseUrl}/api/payments/get-payment-link/${orderCode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  updatePaymentInfo(body: InfoPaymentLink): Observable<Response<any>> {
    return this.httpClient
      .put<Response<any>>(
        `${environment.baseUrl}/api/payments/update-payment-info`,
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