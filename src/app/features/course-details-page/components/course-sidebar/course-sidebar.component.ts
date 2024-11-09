import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ApplicationRef,
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { catchError, first, skip, take } from 'rxjs/operators';
import { SharedModule } from '../../../../shared/shared.module';
import {
  Course,
  CourseMentor,
  Lecturer,
  User,
} from '../../../../common/models';
import {
  CartService,
  DialogBroadcastService,
  SharedService,
  UserStateService,
  WishlistService,
} from '../../../../common/services';
import { CourseDetailService } from '../../core/services';
import { forkJoin, of, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';
import { Cart, CartItem } from '../../../cart-page/core/models';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

interface WishListLocalStorage {
  id: string;
  course_mentor_id: string;
}
@Component({
  selector: 'app-course-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-sidebar.component.html',
  styleUrls: ['./course-sidebar.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseSidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() course: Course | undefined;
  @Input() lecturer: Lecturer | undefined;
  @Input() enrollIds: Array<any> | undefined;
  @Input() blockedUI: boolean | undefined;

  user: User | undefined;
  courseMentorOnline: Array<CourseMentor> | any = [];
  courseMentorOffine: Array<CourseMentor> = [];
  myWishList: Array<WishListLocalStorage> = [{} as WishListLocalStorage];
  cart_id: string | undefined;
  isEnrolledCourse: boolean = false;
  document: any;
  public isExistedCourseInsideCart: boolean = false;
  loading: boolean = false;
  loadingEnrollCourse: boolean = false;

  private timeoutId: any;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sharedService: SharedService,
    private readonly wishlistService: WishlistService,
    private readonly cartService: CartService,
    private readonly detailService: CourseDetailService,
    private readonly userStateService: UserStateService,
    private applicationRef: ApplicationRef,
    private dialogBroadcastService: DialogBroadcastService,
    private ngZone: NgZone, // Giúp Angular nhận biết được sự thay đổi của dữ liệu bên ngoài
    private router: Router
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }

    // Khởi động logic sau khi ứng dụng đã ổn định
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.initData();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && changes['course'].currentValue) {
      if (isPlatformBrowser(this.platformId)) {
        this.ngZone.run(() => {
          this.initData();
        });
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  afterNextRender(callback: () => void) {
    setTimeout(callback, 0);
  }

  initData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = localStorage.getItem('UserInfo')
        ? JSON.parse(localStorage.getItem('UserInfo') || '{}')
        : undefined;
    }

    // Lọc ra danh sách mentor online và offline
    this.courseMentorOnline = [];
    this.loading = true;
    let arrayTemp: Array<CourseMentor> = [];
    this.course?.course_mentor.forEach((item: CourseMentor) => {
      if (!item.is_mentor) {
        this.courseMentorOnline.push(item);
      } else {
        arrayTemp.push(item);
      }
    });
    this.courseMentorOffine = arrayTemp.sort((a, b) => a.amount - b.amount);

    if (!this.user) {
      this.loading = false;
      return;
    }

    // Call API để lấy thông tin giỏ hàng và wishlist của user
    const forkJoinSubscription$ = forkJoin([
      this.cartService.getCart().pipe(
        catchError((error) => {
          return of(null);
        })
      ),
      this.wishlistService.getMyWishList().pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200 && result[1]?.status === 200) {
          // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
          result[0].data.cartItem.map((item: CartItem) => {
            if (item.course_mentor_id === this.courseMentorOnline[0]?.id) {
              this.cart_id = item.id;
              this.isExistedCourseInsideCart = true;
            }
          });

          // Lấy thông tin wishlist của user
          const wishlist: Array<WishListLocalStorage> = [];
          result[1].data.map((item: any) => {
            wishlist.push({
              id: item.id,
              course_mentor_id: item.course_mentor_id,
            });
          });
          this.myWishList = wishlist;
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
          this.loading = false;
        } else {
          this.isExistedCourseInsideCart = false;
          this.loading = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  handleAddToCart(course_mentor: CourseMentor) {
    if (this.loadingEnrollCourse) {
      return;
    }

    const localStorage: Storage = window.localStorage;
    if (localStorage === undefined) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (!localStorage.getItem('isLogin')) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    const addToCartSub$ = this.cartService
      .addToCart(course_mentor.id)
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Đã thêm khóa học vào giỏ hàng',
              type: 'success',
              return: false,
              numberBtn: 1,
            });
            this.cart_id = res.data.id;
            this.isExistedCourseInsideCart = true;
            // this.initData();
          } else if (
            res.status === 400 &&
            res.message === 'Course mentor not found'
          ) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Lỗi',
              message: 'Thêm khóa học không thành công',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
            this.isExistedCourseInsideCart = false;
          } else if (
            res.status === 400 &&
            res.message === 'This course mentor is already in the cart'
          ) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Khóa học đã có trong giỏ hàng',
              type: 'info',
              return: false,
              numberBtn: 1,
            });
            this.isExistedCourseInsideCart = true;
          }
        },
        error: (err) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Lỗi',
            message: 'Thêm khóa học không thành công',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
          this.isExistedCourseInsideCart = false;
        },
      });

    this.subscriptions.push(addToCartSub$);
  }

  handleRemoveCourseFromCart() {
    if (this.loadingEnrollCourse) {
      return;
    }

    if (!this.cart_id) {
      return;
    }

    const removeCourseFromCartSub$ = this.cartService
      .removeFromCart(this.cart_id)
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Đã xóa khóa học khỏi giỏ hàng',
              type: 'success',
              return: false,
              numberBtn: 1,
            });
            this.cart_id = undefined;
            this.isExistedCourseInsideCart = false;
          }
        },
        error: (error: any) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Xóa khóa học khỏi giỏ hàng thất bại',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(removeCourseFromCartSub$);
  }

  checkCourseInWishList(): boolean {
    if (
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      const wishListString = localStorage.getItem('wishlist');
      if (wishListString) {
        try {
          const wishListTemp = JSON.parse(
            wishListString
          ) as Array<WishListLocalStorage>;

          if (wishListTemp !== undefined && wishListTemp.length > 0) {
            this.myWishList = cloneDeep(wishListTemp);
            return this.myWishList.some(
              (item) => item.course_mentor_id === this.courseMentorOnline[0]?.id
            );
          } else {
            return false;
          }
        } catch (e) {
          console.error('Error parsing wishlist from localStorage', e);
          return false;
        }
      }
    }
    return false;
  }

  checkCourseInEnrollList(course_mentor: CourseMentor): boolean {
    if (this.enrollIds && this.enrollIds.length > 0) {
      return this.enrollIds.some(
        (item) => item.course_mentor_id === course_mentor?.id
      );
    }
    return false;
  }

  checkEnoughBalance(course_mentor: CourseMentor): boolean {
    if (this.user && this.user.wallet) {
      return this.user.wallet.balance >= course_mentor.amount;
    } else {
      console.error('User or wallet is undefined');
      return false;
    }
  }

  addCourseInWishList() {
    if (this.loadingEnrollCourse) {
      return;
    }

    if (localStorage.getItem('isLogin')) {
      const addWishListSub$ = this.wishlistService
        .addCourseToWishList(this.courseMentorOnline[0].id)
        .subscribe({
          next: (res) => {
            if (res.status === 201) {
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Đã thêm khóa học vào danh sách yêu thích',
                type: 'success',
                return: false,
                numberBtn: 1,
              });
              this.initData();
            } else {
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Thêm khóa học vào danh sách yêu thích thất bại',
                type: 'error',
                return: false,
                numberBtn: 1,
              });
            }
          },
        });
      this.subscriptions.push(addWishListSub$);
    } else {
      this.sharedService.turnOnSignInDialog();
    }
  }

  removeCourseInWishList() {
    if (this.loadingEnrollCourse) {
      return;
    }

    if (this.myWishList.length > 0) {
      try {
        const wishlist_object = this.myWishList.find(
          (item) => item.course_mentor_id === this.courseMentorOnline[0].id
        );
        if (wishlist_object) {
          const removeWishListSub$ = this.wishlistService
            .removeCourseOutWishList(
              wishlist_object.id,
              wishlist_object.course_mentor_id
            )
            .subscribe({
              next: (res) => {
                if (res.status === 201) {
                  this.dialogBroadcastService.broadcastConfirmationDialog({
                    header: 'Thông báo',
                    message: 'Đã xóa khóa học khỏi danh sách yêu thích',
                    type: 'success',
                    return: false,
                    numberBtn: 1,
                  });
                  this.initData();
                } else {
                  this.dialogBroadcastService.broadcastConfirmationDialog({
                    header: 'Thông báo',
                    message: 'Xóa khóa học khỏi danh sách yêu thích thất bại',
                    type: 'error',
                    return: false,
                    numberBtn: 1,
                  });
                }
              },
            });
          this.subscriptions.push(removeWishListSub$);
        }
      } catch (e) {
        console.error('Error parsing wishlist from localStorage', e);
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Thông báo',
          message: 'Xóa khóa học khỏi danh sách yêu thích thất bại',
          type: 'error',
          return: false,
          numberBtn: 1,
        });
      }
    }
  }

  handleEnrollCourse(course_mentor: CourseMentor) {
    if (!localStorage.getItem('isLogin')) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (this.checkCourseInEnrollList(course_mentor)) {
      // Redirect to learning course
      this.router.navigate([
        `learning-course/${course_mentor.course_id}/${course_mentor.id}`,
      ]);
    } else {
      // Call API enroll course
      this.loadingEnrollCourse = true;
      const enrollCourseSub$ = this.detailService
        .enrollCourse(course_mentor.id)
        .subscribe({
          next: (res) => {
            if (res.status === 200) {
              // Redirect to learning course
              this.isEnrolledCourse = true;
              const newEnrollIds = this.enrollIds ? [...this.enrollIds] : [];
              newEnrollIds.push({
                enroll_id: res.data.id,
                course_mentor_id: res.data.course_mentor_id,
              });
              localStorage.setItem('enrollIds', JSON.stringify(newEnrollIds));
              const updatedUser: User = cloneDeep(this.user!);
              if (updatedUser.wallet) {
                updatedUser.wallet.balance -= course_mentor.amount;
                localStorage.setItem('UserInfo', JSON.stringify(updatedUser));
                this.userStateService.updateUserState(updatedUser);
              }
              this.loadingEnrollCourse = false;
              this.router.navigate([
                `learning-course/${this.course?.id}/${res.data.course_mentor_id}`,
              ]);
            }
          },
          error: (error: any) => {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Đăng ký khóa học thất bại',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
            this.loadingEnrollCourse = false;
            this.isEnrolledCourse = false;
          },
        });
      this.subscriptions.push(enrollCourseSub$);
    }
  }

  handleBuyCourse(course_mentor: CourseMentor) {
    const localStorage: Storage = window.localStorage;
    if (localStorage === undefined) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (!localStorage.getItem('isLogin')) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (!this.checkEnoughBalance(course_mentor)) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Không đủ xu để mua khóa học',
        message: 'Chuyển sang trang ví để nạp thêm xu',
        type: 'info',
        return: true,
        numberBtn: 2,
      });

      // Use skip(1) to ignore the first emission and get only the second value
      this.dialogBroadcastService
        .getDialogConfirm()
        .pipe(
          skip(1), // Skip the first emitted value (previous value)
          take(1) // Take only the next (current) value
        )
        .subscribe((action) => {
          if (action) {
            this.router.navigate(['/wallet']);
            return;
          } else {
            return;
          }
        });
    } else {
      this.handleEnrollCourse(course_mentor);
    }
  }
}
