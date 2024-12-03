import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { Response } from '../../../../../../common/models';
import { ChatBotResponse } from '../models';
import { ErrorHandlingService } from '../../../../../../common/services/error-handling.service';
import { CustomHttpClientService } from '../../../../../../common/services/customHttpClient.service';

@Injectable({
  providedIn: 'root',
})
export class ChatBoxService {
  constructor(
    private customHttp: CustomHttpClientService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  generateChatBot(message: string): Observable<Response<ChatBotResponse>> {
    return this.customHttp
      .post<Response<ChatBotResponse>>(`${environment.baseUrl}/api/chatbots`, { message })
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
