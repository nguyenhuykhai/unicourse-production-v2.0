import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePaymentLink, InfoPaymentLink, PaymentLink, Response } from '../models';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  createPayOSLink(body: CreatePaymentLink): Observable<Response<PaymentLink>> {
    return this.customHttp
      .post<Response<PaymentLink>>(`${environment.baseUrl}/api/payments/create-payment-link`, body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  cancelPaymentLink(orderCode: string): Observable<Response<InfoPaymentLink>> {
    return this.customHttp
      .post<Response<InfoPaymentLink>>(
        `${environment.baseUrl}/api/payments/cancel-payment-link/${orderCode}`,
        { cancellationReason: 'Người dùng hủy giao dịch' }
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  getPaymentLink(orderCode: string): Observable<Response<InfoPaymentLink>> {
    return this.customHttp
      .get<Response<InfoPaymentLink>>(`${environment.baseUrl}/api/payments/get-payment-link/${orderCode}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  updatePaymentInfo(body: InfoPaymentLink): Observable<Response<any>> {
    return this.customHttp
      .put<Response<any>>(
        `${environment.baseUrl}/api/payments/update-payment-info`,
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