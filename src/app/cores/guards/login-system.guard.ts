import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SharedService } from '../../common/services';
import { DOCUMENT } from '@angular/common';

export const loginSystemGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const sharedService: SharedService = inject(SharedService);
  const document = inject(DOCUMENT);

  const localStorage = document.defaultView?.localStorage;

  if (localStorage) {
    const isLoginStr: string | null = localStorage.getItem('isLogin');
    if (isLoginStr === null) {
      sharedService.turnOnSignInDialog();
      router.navigate(['/']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};