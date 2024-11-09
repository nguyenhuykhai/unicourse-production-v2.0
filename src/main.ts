import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ApplicationRef } from '@angular/core';
import { first } from 'rxjs';

bootstrapApplication(AppComponent, appConfig)
  .then((moduleRef) => {
    const applicationRef = moduleRef.injector.get(ApplicationRef);
    applicationRef.isStable
      .pipe(first((isStable) => isStable))
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('Error during stabilization:', err);
        }
      });
  })
  .catch((err) => console.error('Bootstrap error:', err));
