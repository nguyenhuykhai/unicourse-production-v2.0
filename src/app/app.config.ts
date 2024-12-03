import { registerLocaleData } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import localeEn from '@angular/common/locales/en';
import localeVi from '@angular/common/locales/vi';
import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
  provideZoneChangeDetection
} from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Setting Firebase Storage and Authentication
import { IMAGE_CONFIG } from '@angular/common';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { FirebaseOptions } from 'firebase/app';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { MarkdownModule } from 'ngx-markdown';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';

registerLocaleData(localeVi, 'vi');
registerLocaleData(localeEn, 'en');

export const firebaseConfig: FirebaseOptions = {
  apiKey: environment.firebase_config.apiKey,
  authDomain: environment.firebase_config.authDomain,
  projectId: environment.firebase_config.projectId,
  storageBucket: environment.firebase_config.storageBucket,
  messagingSenderId: environment.firebase_config.messagingSenderId,
  appId: environment.firebase_config.appId,
};

const socketConfig: SocketIoConfig = {
  url: environment.socketURL,
  options: {
    reconnectionAttempts: 5,
    timeout: 5000,
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
    importProvidersFrom(
      BrowserAnimationsModule,
      BrowserModule,
      AngularFireModule.initializeApp(firebaseConfig),
      MarkdownModule.forRoot(),
      NgCircleProgressModule.forRoot({
        radius: 100,
        outerStrokeWidth: 16,
        innerStrokeWidth: 8,
        outerStrokeColor: "#1890ff",
        innerStrokeColor: "#69c0ff",
        animationDuration: 300
      }),
      SocketIoModule.forRoot(socketConfig)
    ),
    {
      provide: LOCALE_ID,
      useValue: 'vi-VN',
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
    MessageService
  ],
};
