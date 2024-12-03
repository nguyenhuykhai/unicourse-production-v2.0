import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  // Dùng để hiển thị dialog đăng nhập
  private turnOnSignIn = new BehaviorSubject<boolean>(false);
  turnOnSignIn$ = this.turnOnSignIn.asObservable();

  //   Dùng để tắt dialog đăng nhập
  private turnOffSignIn = new BehaviorSubject<boolean>(false);
  turnOffSignIn$ = this.turnOffSignIn.asObservable();

  // Dùng để gọi hàm setting localStorage khi đăng nhập
  private settingLocal = new BehaviorSubject<boolean>(false);
  settingLocal$ = this.settingLocal.asObservable();

  turnOnSignInDialog() {
    this.turnOnSignIn.next(true);
  }

  turnOffSignInDialog() {
    this.turnOffSignIn.next(false);
  }

  settingLocalStorage() {
    this.settingLocal.next(true);
  }
}
