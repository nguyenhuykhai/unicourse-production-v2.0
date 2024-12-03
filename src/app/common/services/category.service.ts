import { Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Category } from '../models';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getCategories(): Observable<Response<Array<Category>>> {
    return this.customHttp
      .get<Response<Array<Category>>>(`${environment.baseUrl}/api/categories`)
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
