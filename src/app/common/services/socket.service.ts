import {
  Injectable,
  Inject,
  PLATFORM_ID,
  ApplicationRef,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, first, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayloadData, Response } from '../models';
import { Notification, NotificationPayLoad } from '../../shared/components/header/notification/core/models';
import { NotificationStateService } from './notification-state.service';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private notificationStateService: NotificationStateService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Socket is not initialized here, we wait until user logs in.
    }
  }

  // Method to initialize and connect socket with token after login
  connectWithToken(token: string, namespace: string = '/'): void {
    if (this.isBrowser && !this.socket) {
      // Append namespace to the base URL
      const socketURLWithNamespace = `${environment.socketURL}${namespace}`;
      this.socket = io(socketURLWithNamespace, {
        autoConnect: false, // Manual connection required
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
        transports: ['websocket'], // Prefer WebSocket, no long-polling
        auth: {
          token, // Pass the token in the auth object
        },
      });

      this.setupSocketListeners();
      this.socket.connect();
    }
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      const transport = this.socket.io.engine.transport.name; // in most cases, "polling"
      console.log(`Connected with transport: ${transport}`);
      this.connected$.next(true);
      this.reconnectAttempts = 0;
    });

    this.socket.on('notification:receive', (data: Response<PayloadData<NotificationPayLoad>>) => {
      this.notificationStateService.updateNotiState(data.data);
    });

    this.socket.on('connection', (data: any) => {
      console.log('Socket.IO connected:', data);
    });

    this.socket.on('pongFromServer', (data: any) => {
      console.log('Pong from server: ', data);
    })

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
      this.attemptReconnect();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn(`Socket.IO disconnected: ${reason}`);
      this.connected$.next(false);
      if (reason !== 'io client disconnect') {
        this.attemptReconnect();
      }
    });

    this.socket.on('disconnecting', (reason: string) => {
      console.warn(`Socket.IO disconnecting: ${reason}`);
    });
  }

  // Method to disconnect the socket
  disconnect(): void {
    if (this.isBrowser && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  on(event: string, callback: Function): void {
    if (this.isBrowser) {
      this.socket.on(event, (data: any) =>
        this.ngZone.run(() => callback(data))
      );
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.isBrowser) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.isBrowser && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event '${event}', socket is not connected.`);
    }
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  private attemptReconnect(): void {
    if (this.isBrowser && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => {
        this.socket.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Maximum reconnection attempts reached.');
    }
  }
}