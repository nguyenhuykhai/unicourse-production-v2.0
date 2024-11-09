import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { Response } from '../../../../../../common/models';
import { QuestionBank } from '../models';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private httpClient: HttpClient) {}

  getQuestionBankById(id: string): Observable<Response<Array<QuestionBank>>> {
    return this.httpClient
      .get<Response<Array<QuestionBank>>>(`${environment.baseUrl}/api/questions/questionBank/${id}`, {
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
