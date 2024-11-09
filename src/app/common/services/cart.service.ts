import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Wishlist } from '../models';
import { Cart, CartRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private httpClient: HttpClient) {}

  getCart(): Observable<Response<Cart>> {
    return this.httpClient
      .get<Response<Cart>>(`${environment.baseUrl}/api/carts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .pipe(catchError(this.handleError));
  }

  addToCart(course_mentor_id: string): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(`${environment.baseUrl}/api/carts/add`, {
        course_mentor_id,
      })
      .pipe(catchError(this.handleError));
  }

  removeFromCart(cart_id: string): Observable<Response<any>> {
    const UserInfo = localStorage.getItem('UserInfo');
    const user = UserInfo ? JSON.parse(UserInfo) : 0;
    return this.httpClient
      .delete<Response<any>>(`${environment.baseUrl}/api/carts/${cart_id}`)
      .pipe(catchError(this.handleError));
  }

  purchaseCart(body: CartRequest): Observable<Response<any>> {
    return this.httpClient
      .post<Response<any>>(
        `${environment.baseUrl}/api/transactions/purchase`,
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
    // Log the full error details for debugging
    // console.error('Error occurred:', error);
    return throwError(() => error);
  }
}
