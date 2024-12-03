import { Injectable, Optional } from '@angular/core';
import { Banner } from '../models';
import { catchError, Observable, throwError } from 'rxjs';
import { Response } from '../../../../common/models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../common/services/customHttpClient.service';

@Injectable({
    providedIn: 'root'
})
export class BannerService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

    getAllBanners(): Observable<Response<Banner>> {
        return this.customHttp
          .get<Response<Banner>>(`${environment.baseUrl}/api/banners`)
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