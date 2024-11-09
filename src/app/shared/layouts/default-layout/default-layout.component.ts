import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuItem } from 'primeng/api';
import { SignInFormDialogComponent } from './sign-in-form-dialog/sign-in-form-dialog.component';
import { SharedModule } from '../../shared.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SocketService } from '../../../common/services/socket.service';
import { isPlatformBrowser } from '@angular/common';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { User } from '../../../common/models';
import { UserService } from '../../../common/services/user.service';
import { UserStateService } from '../../../common/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    SharedModule,
    SignInFormDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss',
  host: { ngSkipHydration: 'true' },
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  public itemsDesktop: MenuItem[] | undefined;
  public itemsMobile: MenuItem[] | undefined;
  public position: string = 'top';
  user: User | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly userService: UserService,
    private readonly userStateService: UserStateService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof window !== 'undefined' && 'customElements' in window) {
        // Định nghĩa custom element cho lord-icon
        defineElement(lottie.loadAnimation);
        this.initData();
      } else {
        console.warn('Custom Elements are not supported in this environment.');
      }
    }
    this.itemsDesktop = [
      {
        label: 'Messenger',
        icon: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/images%2FSILXCxsl7ZIz3pQS1r.webp?alt=media&token=d488ff9d-2553-48f2-aa91-019829922299',
        command: () => {
          this.openLink('https://m.me/288592671009847')
        }
      },
      {
        label: 'Viết bài',
        icon: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/images%2Fwired-flat-245-edit-document-hover-pinch.gif?alt=media&token=3f9deef5-642c-470e-bd3d-06f1af66428f',
        command: () => {
          this.router.navigate(['/new-post']);
        }
      },
    ];
    this.itemsMobile = [
      {
        label: 'Messenger',
        icon: 'https://media4.giphy.com/media/SILXCxsl7ZIz3pQS1r/giphy.gif?cid=6c09b952cu77koe460xtjyutx33g0ixomyquerxujha78zqz&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s',
        command: () => {
          this.openLink('https://m.me/288592671009847')
        }
      }
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initData(): void {
    if (localStorage.getItem('isLogin')) {
      this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
      const getWalletSub$ = this.userService.getWallet().subscribe({
        next: (res) => {
          if (res.status === 200 && this.user) {
            this.userStateService.updateUserState({
              ...this.user,
              wallet: res.data
            })
          }
        },
        error: (err) => {
          console.error(err);
        }
      })
      this.subscriptions.push(getWalletSub$);
    }
  }

  openLink(link: string): void {
    window.open(`${link}`, '_blank');
  }
}
