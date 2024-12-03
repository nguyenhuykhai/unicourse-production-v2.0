import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Wishlist } from '../models';
import { Cart, CartRequest } from '../models/cart.model';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getCart(): Observable<Response<Cart>> {
    return this.customHttp
      .get<Response<Cart>>(`${environment.baseUrl}/api/carts`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  addToCart(course_mentor_id: string): Observable<Response<any>> {
    return this.customHttp
      .post<Response<any>>(`${environment.baseUrl}/api/carts/add`, {
        course_mentor_id,
      })
      .pipe(catchError((error) => this.handleError(error)));
  }

  removeFromCart(cart_id: string): Observable<Response<any>> {
    return this.customHttp
      .delete<Response<any>>(`${environment.baseUrl}/api/carts/${cart_id}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  purchaseCart(body: CartRequest): Observable<Response<any>> {
    return this.customHttp
      .post<Response<any>>(
        `${environment.baseUrl}/api/transactions/purchase`,
        body,
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
