import { Injectable } from '@angular/core';
import { DialogBroadcastService } from './dialog-broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(
    private dialogBroadcastService: DialogBroadcastService,
  ) {}

  logError(status: number, message: string): void {
    switch (status) {
      case 401:
        console.error('Unauthorized (401): ', message);
        break;
      case 403:
        this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Tài khoản không có quyền truy cập',
            type: 'error',
            return: false,
            numberBtn: 1,
        });
        break;
      case 404:
        console.error('Not Found (404): ', message);
        break;
      case 500:
        console.error('Internal Server Error (500): ', message);
        break;
      default:
        console.error(`Error ${status}: `, message);
    }
  }
}
