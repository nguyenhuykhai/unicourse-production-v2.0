import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../common/models';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userStateSubject = new BehaviorSubject<User | undefined>(undefined);

  constructor() {}

  // Observable for other components to subscribe to
  getUserState(): Observable<User | undefined> {
    return this.userStateSubject.asObservable();
  }

  // Method to update the user wallet balance and emit the new value
  updateUserState(user: User | undefined) {
    this.userStateSubject.next(user);
  }

  // Method to retrieve the current user wallet (synchronously)
  getCurrentUserState(): User | undefined {
    return this.userStateSubject.getValue();
  }
}