import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Response } from '../../../../common/models';
import { Calendar, FilterCalendar } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  constructor(private httpClient: HttpClient) {}

  getListOfflineEnrolledCourses(filter: FilterCalendar): Observable<Response<Array<Calendar>>> {
    return this.httpClient
      .get<Response<Array<Calendar>>>(
        `${environment.baseUrl}/api/students/offline-enrolled-courses?startDate=${filter.startDate}&endDate=${filter.endDate}`,
        {
          headers: {
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
