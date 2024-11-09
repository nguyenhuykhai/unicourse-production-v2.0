import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Subscription } from 'rxjs';
import { UserService } from '../../common/services/user.service';
import { DialogBroadcastService } from '../../common/services';
import { MessageService } from 'primeng/api';
import { ToastObject, User } from '../../common/models';

@Component({
  selector: 'app-accomplishment-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './accomplishment-page.component.html',
  styleUrl: './accomplishment-page.component.scss',
})
export class AccomplishmentPageComponent implements OnInit, OnDestroy {
  public blockedUI: boolean = true;
  user: User | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly userService: UserService,
    private dialogBroadcastService: DialogBroadcastService,
    private ngZone: NgZone,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initData() {
    this.blockedUI = true;
    const userSubscription$ = this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.user = res.data;
          this.blockedUI = false;
        }
      },
      error: () => {
        this.blockedUI = false;
      },
    });

    this.subscriptions.push(userSubscription$);
  }

  // BEHAVIOR LOGIC ZONE
  openLink(url: string): void {
    window.open(url, '_blank');
  }

  showToast(event: ToastObject): void {
    this.messageService.add({
      key: 'tst',
      severity: event.severity,
      summary: event.summary,
      detail: event.detail,
    });
  }
}
