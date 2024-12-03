import { Injectable, Optional } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import { LANGUAGE, UNICOURSE_ERROR_CODE_MESSAGES_EN, UNICOURSE_ERROR_CODE_MESSAGES_VI } from '../../common/constants';

@Injectable({
  providedIn: 'root',
})
export class Helpers {
  public static getPathFromUrl(url: string): string {
    return new URL(url).pathname;
  }

  public static isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwt_decode.jwtDecode(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error decoding token', error);
      return true; // Treat as expired if decoding fails
    }
  }

  public static reAssignToken(res: any) {
    const newAccessToken = res && res.data.accessToken.split(' ')[1];
    const newRefreshToken = res && res.data.refreshToken.split(' ')[1];

    // Save new tokens
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  public static getAccessTokenAndRefreshToken(res: any): { accessToken: string; refreshToken: string } {
    const newAccessToken = res && res.data.accessToken.split(' ')[1];
    const newRefreshToken = res && res.data.refreshToken.split(' ')[1];

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  public static clearLocalStorageAndRedirectAndReload(): void {
    localStorage.clear();
    window.location.href = '/';
    window.location.reload();
  }

  public static navigateToRoute(route: string): void {
    window.location.href = route;
  }

  public static getErrorMessage(code: string, language: string): string {
    const errorMessages: { [key: string]: string } = language === LANGUAGE.VI ? UNICOURSE_ERROR_CODE_MESSAGES_VI : UNICOURSE_ERROR_CODE_MESSAGES_EN;
    if (errorMessages.hasOwnProperty(code)) {
      return errorMessages[code];
    }
    return '';
  }
}
