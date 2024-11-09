import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { Response } from '../../../../../../common/models';
import { ChatBotResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChatBoxService {
  constructor(private httpClient: HttpClient) {}

  generateChatBot(message: string): Observable<Response<ChatBotResponse>> {
    return this.httpClient
      .post<Response<ChatBotResponse>>(`${environment.baseUrl}/api/chatbots`, { message }, {
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
