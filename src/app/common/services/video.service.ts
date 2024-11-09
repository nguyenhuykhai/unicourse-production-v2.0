import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Response, Vimeo } from '../models';
import { CryptoJSService } from './cryptoJS.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  constructor(
    private httpClient: HttpClient,
    private cryptoJSService: CryptoJSService
  ) {}

  getVimeoVideoPreview(id: string, width: number, height: number): Observable<Response<Vimeo>> {
    return this.httpClient
      .get<Response<Vimeo>>(`${environment.baseUrl}/api/videos/vimeo/preview/${id}?width=${width}&height=${height}`)
      .pipe(catchError(this.handleError));
  }

  getVimeoVideoWithAccessToken(courseMentorId: string, videoUrl: string, width: number, height: number): Observable<Response<Vimeo>> {
    return this.httpClient
      .get<Response<Vimeo>>(`${environment.baseUrl}/api/videos/vimeo/${courseMentorId}?width=${width}&height=${height}`,
        {
          headers: {
            'X-Encrypted-Video-ID': this.cryptoJSService.encrypt(videoUrl),
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
