import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Dialog, ConfirmDialog } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DialogBroadcastService {
  private confirmationDialogSubject = new Subject<ConfirmDialog>();
  private dialogConfirm = new BehaviorSubject<Boolean | null>(null); // Changed to BehaviorSubject

  constructor() {}

  // Method to broadcast the confirmation dialog
  broadcastConfirmationDialog(dialog: ConfirmDialog) {
    this.confirmationDialogSubject.next(dialog);
  }

  // Method for components to subscribe to confirmation dialogs
  getConfirmationDialog(): Observable<ConfirmDialog> {
    return this.confirmationDialogSubject.asObservable();
  }

  // Method to confirm the dialog -> Return boolean value
  confirmDialog(confirm: Boolean) {
    this.dialogConfirm.next(confirm);
  }

  // Method for get confirm value, use in another component
  getDialogConfirm(): Observable<Boolean | null> {
    return this.dialogConfirm.asObservable();
  }
}
