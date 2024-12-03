import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationPayLoad } from '../../shared/components/header/notification/core/models';
import { PayloadData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private notificationsStateSubject = new BehaviorSubject<PayloadData<NotificationPayLoad> | undefined>(undefined);

  constructor() {}

  // Observable for other components to subscribe to
  getNotiState(): Observable<PayloadData<NotificationPayLoad> | undefined> {
    return this.notificationsStateSubject.asObservable();
  }

  // Method to update the notificaiton new value
  updateNotiState(notifications: PayloadData<NotificationPayLoad> | undefined) {
    this.notificationsStateSubject.next(notifications);
  }

  // Method to retrieve the current notification (synchronously)
  getCurrentNotiState(): PayloadData<NotificationPayLoad> | undefined {
    return this.notificationsStateSubject.getValue();
  }
}