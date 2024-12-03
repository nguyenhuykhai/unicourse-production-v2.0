// error-handling.service.ts
import { Injectable, Optional } from '@angular/core';
import { DialogBroadcastService } from './dialog-broadcast.service';
import {
  UNICOURSE_ERROR_CODE_MESSAGES_EN,
  UNICOURSE_ERROR_CODE_MESSAGES_VI,
  LANGUAGE,
} from '../constants';
import { AuthService } from '../../shared/layouts/default-layout/sign-in-form-dialog/core/services';
import { Helpers } from '../../cores/utils';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private language: string = LANGUAGE.VI; // Default language
  private refreshTokenInProgress = false;

  constructor(
    private readonly dialogBroadcastService: DialogBroadcastService,
    private readonly authService: AuthService,
  ) {}

  setLanguage(language: string): void {
    this.language = language;
  }

  private getErrorMessages(): Record<string, string> {
    return this.language === LANGUAGE.VI
      ? UNICOURSE_ERROR_CODE_MESSAGES_VI
      : UNICOURSE_ERROR_CODE_MESSAGES_EN;
  }

  logError(status: number, code: string, message: string): void {
    const errorMessages = this.getErrorMessages();
    if (errorMessages.hasOwnProperty(code)) {
      switch (code) {
        case 'UNC002':
          this.handleDisplayDialog(code, () => {
            Helpers.clearLocalStorageAndRedirectAndReload();
          });
          break;
        case 'UNC013':
          const token = localStorage.getItem('accessToken');
          if (token && Helpers.isTokenExpired(token) && !this.refreshTokenInProgress) {
            this.refreshTokenInProgress = true;
            this.authService.refreshToken().subscribe({
              next: (res: any) => {
                if (res && res.data) {
                  Helpers.reAssignToken(res);
                }
              },
              error: (error: any) => {
                console.error('Error refreshing token: ', error);
                this.authService.doLogout().subscribe(() => {
                  Helpers.clearLocalStorageAndRedirectAndReload();
                });
              },
            });
          }
          break;
        case 'UNC016':
          this.handleDisplayDialog(code, () => {
            this.authService.doLogout().subscribe(() => {
                Helpers.clearLocalStorageAndRedirectAndReload();
              });
          });
          break;
        case 'UNC019':
          this.handleDisplayDialog(code, () => {
            Helpers.clearLocalStorageAndRedirectAndReload();
          });
          break;
        case 'UNC020':
          this.handleDisplayDialog(code, () => {
            Helpers.clearLocalStorageAndRedirectAndReload();
          });
          break;
        case 'UNC053':
          this.handleDisplayDialog(code, () => {
            Helpers.clearLocalStorageAndRedirectAndReload();
          });
          break;
        case 'UNCW001':
          console.error('UNCW001: ', code);
          this.handleDisplayDialog(code, () => {
            Helpers.navigateToRoute('/');
          });
          break;
        default:
      }
    }
  }

  private handleDisplayDialog(code: string, callback?: (...args: any[]) => void, args?: any[]): void {
    this.dialogBroadcastService.broadcastConfirmationDialog({
      header:
        this.language === LANGUAGE.VI ? 'Thông báo' : 'Notification',
      message:
        this.language === LANGUAGE.VI
        ? UNICOURSE_ERROR_CODE_MESSAGES_VI[code as keyof typeof UNICOURSE_ERROR_CODE_MESSAGES_VI]
        : UNICOURSE_ERROR_CODE_MESSAGES_EN[code as keyof typeof UNICOURSE_ERROR_CODE_MESSAGES_EN],
      type: 'error',
      return: false,
      numberBtn: 1,
      callback,
      args,
    });
  }
}
