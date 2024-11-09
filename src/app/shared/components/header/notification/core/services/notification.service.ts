import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environments/environment';
import { Filter, PayloadData, Response } from '../../../../../../common/models';
import { NotificationPayLoad } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private httpClient: HttpClient) {}

  getAllNotiByFilter(filter: Filter): Observable<Response<PayloadData<NotificationPayLoad>>> {
    return this.httpClient
      .post<Response<PayloadData<NotificationPayLoad>>>(
        `${environment.baseUrl}/api/notifications/list`,
        filter,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  putMarkAsReaded(notificationRecipientId: number): Observable<Response<NotificationPayLoad>> {
    return this.httpClient
      .put<Response<NotificationPayLoad>>(
        `${environment.baseUrl}/api/notifications/${notificationRecipientId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .pipe(catchError(this.handleError));
  }

  putMarkAllAsReaded(notifications: Array<number>): Observable<Response<Array<NotificationPayLoad>>> {
    return this.httpClient
      .put<Response<Array<NotificationPayLoad>>>(
        `${environment.baseUrl}/api/notifications/reads`,
        { notificationReceipient: notifications },
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
