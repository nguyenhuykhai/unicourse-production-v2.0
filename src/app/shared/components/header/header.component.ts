import { CUSTOM_ELEMENTS_SCHEMA, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LOGO } from '../../../../assets';
import { SharedModule } from '../../shared.module';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Models
import { Course, Filter, PayloadData, User } from '../../../common/models';

// Components
import { NavigationComponent } from '../navigation/navigation.component';

// Services
import { MenuItem, MessageService } from 'primeng/api';
import { NotificationStateService, SharedService, UserStateService } from '../../../common/services';
import { AuthService } from '../../layouts/default-layout/sign-in-form-dialog/core/services';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { CourseService } from '../../../common/services/course.service';
import { NotificationComponent } from "./notification/notification.component";
import { NotificationService } from './notification/core/services';
import { CatcheNotiDataWithFilter, NotificationPayLoad } from './notification/core/models';

declare interface Options {
  name: string;
  path: string;
  iconString?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule, NavigationComponent, SearchDialogComponent, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('op') overlayPanel!: OverlayPanel;
  @ViewChild('searchDialog') searchDialog!: OverlayPanel;
  @ViewChild('moreOptionsDialog') moreOptionsDialog!: OverlayPanel;
  @ViewChild('notificationOverPlay') notificationOverPlay!: OverlayPanel;
  public LOGO = LOGO;
  public items: MenuItem[] | undefined;
  public moreOptions!: Options[];
  public user: User | undefined;
  public lengthOfCartItems = 0;
  public subscriptions: Subscription[] = [];
  indicatorPosition: number = 0;

  // NOTIFICATION ZONE
  loadingNoti: boolean = false;
  notifications: PayloadData<NotificationPayLoad> | undefined;
  allAsRead: boolean = false;
  filterNoti: Filter = {
    page: 1,
    pageSize: 5,
    where: {},
    orderBy: {
      created_at: 'desc',
    },
  };
  
  // SEARCH ZONE
  public searchText: string = '';
  public dataSearch: PayloadData<Course> | undefined;
  loadingSearch: boolean = false;
  searchTextChanged = new Subject<{ text: string, event: Event }>();

  public filterCourses: Filter = {
    page: 1,
    pageSize: 3,
    where: {
      status: {
        equals: 'PUBLISHED',
      }
    },
    orderBy: {}
  };

  constructor(
    private readonly sharedService: SharedService,
    private readonly authService: AuthService,
    private readonly courseService: CourseService,
    private readonly notificationService: NotificationService,
    private readonly notificationStateService: NotificationStateService,
    private router: Router,
    private messageService: MessageService,
    private userStateService: UserStateService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);

      this.settingUserInfo();
      this.configMoreOptions();
      this.subscriptions.push(
        this.userStateService.getUserState().subscribe((user) => {
          this.ngZone.run(() => {
            if (user) {
              this.user = user;
            }
          });
        })
      );
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }

    // Debounce logic for search input
    this.searchTextChanged
      .pipe(
        debounceTime(500), // 1 second delay
        distinctUntilChanged((prev, curr) => prev.text === curr.text) // Compare text for changes
      )
      .subscribe(({ text, event }) => {
        if (text.trim() === '') {
          this.searchDialog.hide();
          this.loadingSearch = false;
          return;
        } else {
          this.loadingSearch = true;
          this.filterCourses.where = {
            ...this.filterCourses.where,
            title: {
              contains: text,
            },
          };
          this.searchDialog.show(event);  // Pass the event here
        }

        if (text.match(/[!@#$%^&*(),.?":{}|<>]/g)) {
          this.loadingSearch = false;
          return;
        }

        const searchAllSub$ = this.courseService
          .getCourseFilter(this.filterCourses)
          .subscribe({
            next: (res: any) => {
              if (res && res.status === 200) {
                this.loadingSearch = false;
                this.dataSearch = res.data;
              }
            },
            error: (err: Error) => {
              this.loadingSearch = false;
              this.dataSearch = undefined;
            },
          });
        this.subscriptions.push(searchAllSub$);
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public turnOnSignInDialog() {
    this.sharedService.turnOnSignInDialog();
  }

  setActive(index: number) {
    this.indicatorPosition = index * 70; // 70px là chiều rộng của mỗi item
    const items = document.querySelectorAll('.list');
    items.forEach((item) => item.classList.remove('active'));
    items[index].classList.add('active');
  }

  configMoreOptions() {
    this.moreOptions = [
      {
        name: 'Bài viết (Blog)',
        path: '/blog',
        iconString: 'https://cdn.lordicon.com/awgiupxe.json'
      },
      {
        name: 'Viết bài mới',
        path: '/new-post',
        iconString: 'https://cdn.lordicon.com/igljtrxq.json'
      },
      {
        name: 'Hỏi đáp (FAQ)',
        path: '/qna',
        iconString: 'https://cdn.lordicon.com/rttwnbcz.json'
      }
    ]
  }

  settingUserInfo() {
    if (typeof localStorage !== 'undefined') {
      const userLocal = localStorage.getItem('UserInfo');
      if (userLocal) {
        this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
        this.fetchNotification();
      }
    }

    const settingLocalSub = this.sharedService.settingLocal$.subscribe({
      next: (res: boolean) => {
        if (res === true) {
          this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
          this.messageService.add({
            severity: 'success',
            summary: 'Đăng nhập',
            detail: 'Đăng nhập tài khoản thành công',
          });
        }
      },
    });
    this.subscriptions.push(settingLocalSub);
  }

  logout() {
    this.authService.doLogout();
    // Đăng xuất thì xóa hết dữ liệu trong localStorage
    localStorage.clear();
    this.user = undefined;
    this.router.navigate(['/']);
    window.location.reload();
  }

  // INITIZALIZATION ZONE
  fetchNotification() {
    this.loadingNoti = true;

    // Check if notification state is already available
    const currentNotifications = this.notificationStateService.getCurrentNotiState();
    if (currentNotifications) { // If available, use it
      this.notifications = currentNotifications;
      this.allAsRead = this.notifications.data.every((noti) => noti.is_read);
      this.loadingNoti = false;
      return;
    } else { // If not available, fetch from server
      const fetchNotiSub$ = this.notificationService
        .getAllNotiByFilter(this.filterNoti)
        .subscribe({
          next: (res) => {
            if (res.status === 200) {
              this.notifications = res.data;
              this.allAsRead = this.notifications.data.every(
                (noti) => noti.is_read
              );
              this.loadingNoti = false;
            }
          },
          error: (error) => {
            console.error(error);
            this.loadingNoti = false;
          },
        });
      this.subscriptions.push(fetchNotiSub$);
    }

    // Listen for real-time notification updates
    this.subscriptions.push(
      this.notificationStateService.getNotiState().subscribe((notifications) => {
        this.ngZone.run(() => {
          this.filterNoti.page = 1;
          this.filterNoti.pageSize = notifications?.totalPages ?? 1;
          if (notifications) {
            this.notifications = notifications;
            this.allAsRead = this.notifications.data.every((noti) => noti.is_read);
          }
        });
      })
    );
  }

  // ROUTER NAVIGATION ZONE
  redirectToOptions(path: string) {
    this.moreOptionsDialog.hide();
    this.router.navigate([path]);
  }

  redirecFromOverlayPanel (path: string, toggleOverlay?: boolean) {
    !toggleOverlay ? this.toggleOverlay(new Event('click')) : '';
    this.router.navigate([path]);
  }

  // BEHAVIOR ZONE
  toggleOverlay(event: Event): void {
    if (this.overlayPanel) {
      this.overlayPanel.toggle(event);
    }
  }

  toggleDialog(event: Event): void {
    this.moreOptionsDialog.toggle(event);
  }

  toggleOverlayForSearch(event: Event): void {
    this.searchTextChanged.next({ text: this.searchText, event }); // Emit both search text and event
  }

  toggleOverlayFromChild(event: boolean): void {
    this.searchDialog.toggle(event);
    this.searchText = '';
  }

  toggleNotificationOverlay(event: Event): void {
    this.notificationOverPlay.toggle(event);
  }

  handleOnMarkAllAsReaded(): void {
    this.notifications?.data.map((noti) => {
      noti.is_read = true;
    });
    this.allAsRead = true;
  }

  handleMovePrevNotification(): void {
    this.filterNoti.page = this.filterNoti.page - 1;
    this.fetchNotification();
  }

  handleMoveNextNotification(): void {
    this.filterNoti.page = this.filterNoti.page + 1;
    this.fetchNotification();
  }
}