import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// IMPORT SERVICES
import { RecommendationService } from './core/services';

// IMPORT MODELS
import { Cart, CartItem, RecommendationItem } from './core/models';

// IMPORT COMPONENTS
import { CartItemComponent } from './component/cart-item/cart-item.component';
import { WishlistItemComponent } from './component/wishlist-item/wishlist-item.component';
import { RecommendationItemComponent } from './component/recommendation-item/recommendation-item.component';
import { PaymentComponent } from './component/payment/payment.component';
import { catchError, forkJoin, of, skip, Subscription, take } from 'rxjs';
import { CourseFilterResponse, CourseMentor, Filter, Response, Wishlist } from '../../common/models';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CourseDetailService } from '../course-details-page/core/services';
import { CartService, DialogBroadcastService, WishlistService } from '../../common/services';
import { CourseService } from '../../common/services/course.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
  imports: [
    CommonModule,
    CartItemComponent,
    RecommendationItemComponent,
    WishlistItemComponent,
    PaymentComponent,
    SharedModule,
  ],
})
export class CartPageComponent implements OnInit {
  recommendations: RecommendationItem[] = [];
  public rating: number = 5; // Số lượng sao
  public stars: number[] = Array(this.rating).fill(0);
  public cart: Cart | undefined;
  public wishlist: Wishlist[] | undefined;
  public feeCourses: CourseFilterResponse | undefined;
  public filterFeeCourses: Filter = {
    page: 1,
    pageSize: 4,
    where: {
      status: {
        equals: 'PUBLISHED',
      },
    },
    orderBy: {
      price: 'desc',
    },
  };

  // BEHAVIOR DATA
  currentFeePage: number = 1;
  totalFeePages: number = 1;
  public feeCourseLoading: boolean = false;
  public blockedUI: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly cartService: CartService,
    private readonly wishlistService: WishlistService,
    private readonly courseService: CourseService,
    private recommendationService: RecommendationService,
    private dialogBroadcastService: DialogBroadcastService,
    private router: Router,
    private ngZone: NgZone // Giúp Angular nhận biết được sự thay đổi của dữ liệu bên ngoài
  ) {}

  ngOnInit(): void {
    this.recommendations = this.recommendationService.getRecommendations();
    this.initData();
  }

  initData() {
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
      this.courseService
        .getCourseFilter(this.filterFeeCourses)
        .pipe(
          catchError((error) => {
            console.error('Error fetching fee courses', error); // Handle error
            return of(null);
          })
        ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (
          result[0]?.status === 200 &&
          result[1]?.status === 200 &&
          result[2]?.status === 200
        ) {
          this.cart = result[0].data;
          this.wishlist = result[1].data;
          this.feeCourses = result[2].data;
          this.totalFeePages = result[2].data.totalPages;
          this.currentFeePage = result[2].data.page;
          this.blockedUI = false;
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  addCourseInWishList(item: CartItem) {
    if (this.checkCourseInWishList(item)) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Khóa học đã có trong danh sách yêu thích',
        type: 'info',
        return: false,
        numberBtn: 1,
      });
      return;
    }

    const addWishListSub$ = this.wishlistService
      .addCourseToWishList(item.course_mentor_id)
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.initData();
          }
        },
        error: (error: any) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Thêm khóa học vào danh sách yêu thích thất bại',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(addWishListSub$);
  }

  handleRemoveCourseFromWishList(item: Wishlist) {
    const removeCourseFromWishListSubscription$ = this.wishlistService
      .removeCourseOutWishList(item.id, item.course_mentor_id)
      .subscribe({
        next: (res: Response<any>) => {
          if (res.status === 201) {
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
        error: (error: any) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Xóa khóa học khỏi danh sách yêu thích thất bại',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(removeCourseFromWishListSubscription$);
  }

  checkCourseInWishList(item: CartItem): boolean {
    if (this.wishlist) {
      return this.wishlist.some(
        (wishlist) => wishlist.course_mentor_id === item.course_mentor_id
      );
    }
    return false;
  }

  checkCourseInCart(course_mentor_id: string | undefined): boolean {
    if (this.cart && course_mentor_id) {
      return this.cart.cartItem.some(
        (cart) => cart.course_mentor_id === course_mentor_id
      );
    }
    return false;
  }

  handleAddToCart(item: any) {
    const checkCartOrWishlist = this.isCartorWishlist(item);
    switch (checkCartOrWishlist) {
      case 1: // Recommendation
        break;
      case 2: // Wishlist
        if (this.checkCourseInCart(item?.course_mentor_id)) {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Khóa học đã có trong giỏ hàng',
            type: 'info',
            return: false,
            numberBtn: 1,
          });
          return;
        }
        this.handleAddToCartFromWishlist(item as Wishlist);
        break;
      default:
        break;
    }
  }

  handleAddToCartFromWishlist(item: Wishlist) {
    const addToCartSub$ = this.cartService
      .addToCart(item.course_mentor_id)
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.initData();
          }
        },
        error: (err) => {
          if (err.error.message === 'Student already enrolled in this course') {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Bạn đã đăng ký khóa học này rồi',
              message: 'Vào kiểm tra khoá học của bạn ngay thôi',
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
                this.router.navigate(['/my-courses']);
                return;
              } else {
                return;
              }
            });
          } else {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Lỗi',
              message: 'Thêm khóa học không thành công',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
          }
        },
      });

    this.subscriptions.push(addToCartSub$);
  }

  handleRemoveCourseFromCart(item: CartItem) {
    const removeCourseFromCartSub$ = this.cartService
      .removeFromCart(item.id)
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.initData();
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

  handleRefreshData() {
    this.initData();
  }

  private isCartorWishlist(item: any): number {
    if (item.course_mentor_id) { // Check if item from Wishlist component
      return 2;
    } else { // Check if item from Recommendation component
      return 1;
    }
  }
}
