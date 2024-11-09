import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Response } from '../../../../common/models';
import { LecturerProfile } from '../models';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LecturerProfileService {
  constructor(private httpClient: HttpClient) {}

  getLecturerById(id: number): Observable<Response<LecturerProfile>> {
    return this.httpClient
      .get<Response<LecturerProfile>>(
        `${environment.baseUrl}/api/lecturers/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    // Handle the error appropriately here
    return throwError(() => new Error(error));
  }
}
