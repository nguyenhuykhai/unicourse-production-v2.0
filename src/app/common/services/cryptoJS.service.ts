import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CryptoJSService {
  public encrypt(password: string): string {
    return CryptoJS.AES.encrypt(password, environment.vimeoKey).toString();
  }
  public decrypt(passwordToDecrypt: string) {
    return CryptoJS.AES.decrypt(
      passwordToDecrypt,
      environment.vimeoKey
    ).toString(CryptoJS.enc.Utf8);
  }
}
