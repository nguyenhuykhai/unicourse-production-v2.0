import { Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Vimeo } from '../models';
import { CryptoJSService } from './cryptoJS.service';
import { ErrorHandlingService } from './error-handling.service';
import { CustomHttpClientService } from './customHttpClient.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(
    private customHttp: CustomHttpClientService,
    private cryptoJSService: CryptoJSService,
    @Optional() private readonly errorHandlingService?: ErrorHandlingService
  ) {}

  getVimeoVideoPreview(id: string, width: number, height: number): Observable<Response<Vimeo>> {
    return this.customHttp
      .get<Response<Vimeo>>(`${environment.baseUrl}/api/videos/vimeo/preview/${id}?width=${width}&height=${height}`)
      .pipe(catchError((error) => this.handleError(error)));
  }

  getVimeoVideoWithAccessToken(courseMentorId: string, videoUrl: string, width: number, height: number): Observable<Response<Vimeo>> {
    const customHeaders = new HttpHeaders({
      'X-Encrypted-Video-ID': this.cryptoJSService.encrypt(videoUrl), // Custom header
    });
  
    return this.customHttp
      .get<Response<Vimeo>>(
        `${environment.baseUrl}/api/videos/vimeo/${courseMentorId}?width=${width}&height=${height}`,
        customHeaders
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
