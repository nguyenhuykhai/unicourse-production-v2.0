import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  PLATFORM_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './cores/interceptors/auth.interceptor'
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import localeEn from '@angular/common/locales/en';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

// Setting Firebase Storage and Authentication
import { AngularFireModule } from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { MarkdownModule } from 'ngx-markdown';
import { IMAGE_CONFIG } from '@angular/common';
import { MessageService } from 'primeng/api';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
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
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
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
