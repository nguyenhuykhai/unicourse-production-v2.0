import {
  Injectable,
  Inject,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, catchError, filter, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/layouts/default-layout/sign-in-form-dialog/core/services';
import { Helpers } from '../../cores/utils';
import { PayloadData, Response } from '../models';
import { NotificationPayLoad } from '../../shared/components/header/notification/core/models';
import { NotificationStateService } from './notification-state.service';
import { DialogBroadcastService } from './dialog-broadcast.service';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private isBrowser: boolean;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000; // 2 seconds
  private connected$ = new BehaviorSubject<boolean>(false);

  // Token Management
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private authService: AuthService,
    private notificationStateService: NotificationStateService,
    private readonly errorHandlingService: ErrorHandlingService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  connect(namespace: string = '/'): void {
    if (!this.isBrowser) return;

    this.handleToken().pipe(
      switchMap((token) => {
        if (!this.socket || !this.socket.connected) {
          this.initializeSocket(namespace, token);
        }
        return of(true);
      }),
      catchError((error) => {
        console.error('Error connecting to socket:', error);
        return of(false);
      })
    ).subscribe();
  }

  private initializeSocket(namespace: string, token: string): void {
    const socketURLWithNamespace = `${environment.socketURL}${namespace}`;

    this.socket = io(socketURLWithNamespace, {
      autoConnect: false,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      transports: ['websocket'],
      auth: {
        token, // Pass the token in the auth object
      },
    });

    this.setupSocketListeners();
    this.socket.connect();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected.');
      this.connected$.next(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn(`Socket disconnected: ${reason}`);
      this.connected$.next(false);
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.attemptReconnect();
    });

    this.socket.on('notification:receive', (data: Response<PayloadData<NotificationPayLoad>>) => {
      this.notificationStateService.updateNotiState(data.data);
    });

    this.socket.on('system:alert_login', (data: Response<any>) => {
      if (data.code) {
        this.errorHandlingService.logError(data.status, data.code, data.message);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.isBrowser && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      this.handleToken().pipe(
        switchMap((token) => {
          if (this.socket) {
            this.socket.auth = { token }; // Update token in auth object
            this.socket.connect();
          }
          return of(true);
        })
      ).subscribe();
    } else {
      console.error('Maximum reconnection attempts reached.');
    }
  }

  private handleToken(): Observable<string> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return of(''); // No token, proceed without Authorization
    }

    if (Helpers.isTokenExpired(token)) {
      return this.refreshToken(); // Refresh token if expired
    }

    return of(token); // Token is valid, return it
  }

  private refreshToken(): Observable<string> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null), // Type guard to assert token is string
        take(1)
      );      
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null); // Reset the subject

    return this.authService.refreshToken().pipe(
      switchMap((res: any) => {
        const newToken = res.data.accessToken.split(' ')[1];
        localStorage.setItem('accessToken', newToken);
        const newRefreshToken = res.data.refreshToken.split(' ')[1];
        localStorage.setItem('refreshToken', newRefreshToken);

        this.isRefreshing = false;
        this.refreshTokenSubject.next(newToken); // Notify waiting observers
        return of(newToken);
      }),
      catchError((error) => {
        console.error('Error refreshing token:', error);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        return of(''); // Return empty string if refresh fails
      })
    );
  }

  disconnect(): void {
    if (this.isBrowser && this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  emit(event: string, data: any): void {
    if (this.isBrowser && this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event '${event}', socket is not connected.`);
    }
  }

  on(event: string, callback: Function): void {
    if (this.isBrowser && this.socket) {
      this.socket.on(event, (data: any) =>
        this.ngZone.run(() => callback(data))
      );
    }
  }

  off(event: string): void {
    if (this.isBrowser && this.socket) {
      this.socket.off(event);
    }
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}