import { Injectable, Optional } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { Filter, PayloadData, Response } from '../../../../../../common/models';
import { NotificationPayLoad } from '../models';
import { ErrorHandlingService } from '../../../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getAllNotiByFilter(filter: Filter): Observable<Response<PayloadData<NotificationPayLoad>>> {
    return this.customHttp
      .post<Response<PayloadData<NotificationPayLoad>>>(
        `${environment.baseUrl}/api/notifications/list`,
        filter
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  putMarkAsReaded(notificationRecipientId: number): Observable<Response<NotificationPayLoad>> {
    return this.customHttp
      .put<Response<NotificationPayLoad>>(
        `${environment.baseUrl}/api/notifications/${notificationRecipientId}/read`,
        {}
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  putMarkAllAsReaded(notifications: Array<number>): Observable<Response<Array<NotificationPayLoad>>> {
    return this.customHttp
      .put<Response<Array<NotificationPayLoad>>>(
        `${environment.baseUrl}/api/notifications/reads`,
        { notificationReceipient: notifications }
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