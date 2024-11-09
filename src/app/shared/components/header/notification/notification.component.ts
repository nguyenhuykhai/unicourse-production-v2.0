import { ApplicationRef, Component, EventEmitter, Inject, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Filter, PayloadData, User } from '../../../../common/models';
import { NotificationCategory, NotificationPayLoad } from './core/models';
import { MenuItem } from 'primeng/api';
import { isPlatformBrowser } from '@angular/common';
import { NotificationService } from './core/services';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: User | undefined;
  @Input() notifications: PayloadData<NotificationPayLoad> | undefined;
  @Input() loadingNoti: boolean | undefined;
  @Output() readonly onMarkAllAsReaded = new EventEmitter<void>();
  @Output() readonly onMovePrevNotification = new EventEmitter<void>();
  @Output() readonly onMoveNextNotification = new EventEmitter<void>();


  loading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['notifications'] && changes['notifications'].currentValue) {
        this.notifications = changes['notifications'].currentValue;
      }
  }

  ngOnDestroy(): void {}

  // INITIALIZATION ZONE
  markAllAsReaded(): void {
    const notifications = this.notifications?.data.map((noti) => noti.id);
    if (!notifications || this.loading) {
      return;
    }

    if (this.notifications?.data.every((noti) => noti.is_read)) {
      return;
    }

    this.loading = true;
    const markAllAsReadedSub = this.notificationService.putMarkAllAsReaded(notifications).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.notifications?.data.map((noti) => {
            noti.is_read = true;
          });
          this.onMarkAllAsReaded.emit();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      }
    });
    this.subscriptions.push(markAllAsReadedSub);
  }

  markAsReaded(noti: NotificationPayLoad): void {
    if (noti && noti.notification?.category === NotificationCategory.USER) {
      this.routerToNotificationDetail(noti.notification.url_link);
    }

    if (noti.is_read || this.loading) {
      return;
    }

    this.loading = true;
    const markAsReadedSub = this.notificationService
      .putMarkAsReaded(noti.id)
      .subscribe({
        next: (res) => {
            if (res.status === 200 && this.notifications) {
              noti.is_read = true;
              const checkAllReaded = this.notifications?.data.every(
                (noti) => noti.is_read
              );
              checkAllReaded ? this.onMarkAllAsReaded.emit() : '';
              this.loading = false;
              if (noti.notification?.category === NotificationCategory.USER) {
                this.routerToNotificationDetail(noti.notification.url_link);
              }
            }
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
        },
      });
    this.subscriptions.push(markAsReadedSub);
  }

  // LOGIC ZONE
  convertDateToString(date: string): string {
    const currentDate = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return 'hôm nay';
    } else if (diffDays === 1) {
      return 'hôm qua';
    } else {
      return `${diffDays} ngày trước`;
    }
  }

  handleMovePrevNotification() {
    if (this.loading || this.loadingNoti || this.notifications?.page === 1) {
      return;
    }

    this.onMovePrevNotification.emit();
  }

  handleMoveNextNotification() {
    if (this.loading || this.loadingNoti || this.notifications?.page === this.notifications?.totalPages) {
      return;
    }

    this.onMoveNextNotification.emit();
  }

  // ROUTER ZONE
  routerToNotificationDetail(link: string | undefined): void {
    if (!link) {
      return;
    }
    this.router.navigate([link]);
  }
}
