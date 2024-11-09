import { Injectable } from '@angular/core';
import { Banner } from '../models';
import { catchError, Observable, throwError } from 'rxjs';
import { Response } from '../../../../common/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BannerService {
    constructor(private httpClient: HttpClient) {}

    getAllBanners(): Observable<Response<Banner>> {
        return this.httpClient
          .get<Response<Banner>>(`${environment.baseUrl}/api/banners`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
          .pipe(catchError(this.handleError));
      }

      private handleError(error: any) {
        // Handle the error appropriately here
        return throwError(() => new Error(error));
      }
}