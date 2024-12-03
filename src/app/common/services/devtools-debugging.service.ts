import { Injectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DevtoolsDebuggingService implements OnInit, OnDestroy {
  private intervalId: any;

  constructor(private ngZone: NgZone, private router: Router) {}

  ngOnInit(): void {
    this.startDevToolsDetection();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startDevToolsDetection(): void {
    this.intervalId = setInterval(() => {
      this.ngZone.runOutsideAngular(() => {
        const t0 = Date.now();
        debugger; // Execution stops here if DevTools is open
        const t1 = Date.now();

        if (Math.abs(t1 - t0) > 1000) { // Cho phép sai số 1000ms
          console.warn('DevTools is open. Redirecting...');
          this.redirectToHome();
        }  
      });
    }, 1000); // Check every second
  }

  private redirectToHome(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Stop further checks
    }
    this.ngZone.run(() => {
      this.router.navigate(['/']); // Redirect to home or desired route
    });
  }
}
