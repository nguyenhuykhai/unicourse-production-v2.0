import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  Inject,
  PLATFORM_ID,
  NgZone,
  OnDestroy,
} from '@angular/core';

import { SharedModule } from '../../shared.module';
import { isPlatformBrowser } from '@angular/common';
import { UserStateService } from '../../../common/services';
import { User } from '../../../common/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NavigationComponent implements OnInit, OnDestroy {
  indicatorPosition: number = 0;
  activeIndex: number = 0;
  user: User | undefined;

  items = [
    { text: 'Trang chủ', icon: 'home-outline', link: '/' },
    { text: 'Bài viết', icon: 'reader-outline', link: '/blog' },
    { text: 'Giới thiệu', icon: 'people-outline', link: '/about-us' },
    { text: 'Liên hệ', icon: 'mail-outline', link: '/contact' },
    { text: 'Chính sách', icon: 'flag-outline', link: '/policy' },
    { text: 'FAQ', icon: 'help-circle-outline', link: '/qna' },
  ];

  public subscriptions: Subscription[] = [];

  setActive(index: number) {
    this.indicatorPosition = index * 70; // 70px là chiều rộng của mỗi item
    this.activeIndex = index;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly userStateService: UserStateService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userSub$ = this.userStateService.getUserState().subscribe((user) => {
        if (user) {
          this.ngZone.run(() => {
            this.user = user;
          });
        } else {
          const userLocal = localStorage.getItem('UserInfo');
          if (userLocal) {
            this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
            this.userStateService.updateUserState(this.user);
          }
        }
      });
      this.subscriptions.push(userSub$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
