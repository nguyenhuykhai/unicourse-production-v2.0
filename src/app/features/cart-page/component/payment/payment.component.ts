import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement, In } from '@lordicon/element';
import lottie from 'lottie-web';
import { Cart, CartItem, CartRequest } from '../../core/models';
import { skip, Subscription, take } from 'rxjs';
import {
  CartService,
  DialogBroadcastService,
  UserStateService,
} from '../../../../common/services';
import { User } from '../../../../common/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaymentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item!: Cart;
  @Output() isRefresh = new EventEmitter<boolean>();
  user: User | undefined;
  coinBalance = 0;
  cartTotal = 0;
  discount = 0;
  total = this.cartTotal - this.discount;
  blockedUI: boolean | undefined;

  private cartRequest: CartRequest | undefined;

  public subscriptions: Subscription[] = [];

  constructor(
    private userStateService: UserStateService,
    private ngZone: NgZone,
    private dialogBroadcastService: DialogBroadcastService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
      this.initData();
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && !changes['item'].isFirstChange()) {
      this.initData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initData() {
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
    let arrayCartItem: Array<CartItem> = this.item.cartItem;
    this.cartTotal = arrayCartItem.reduce(
      (sum, item) => sum + item.course_mentor.amount,
      0
    );
    this.total = this.cartTotal - this.discount;
  }

  // LOGIC ZONE
  handlePayment() {
    if (this.checkBalanceEnough()) {
      this.blockedUI = true;
      this.cartRequest = {
        id: this.item.id,
        final_amount: this.total,
        total_amount: this.cartTotal,
        cart_items: this.item.cartItem.map((item) => ({
          course_mentor_id: item.course_mentor_id,
          amount: item.course_mentor.amount,
        })),
      };
      const purchaseSub$ = this.cartService
        .purchaseCart(this.cartRequest)
        .subscribe({
          next: (res) => {
            if (res.status === 201) {
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Thanh toán thành công',
                type: 'success',
                return: true,
                numberBtn: 1,
              });
              if (this.user && this.user.wallet) {
                this.user.wallet.balance =
                  this.user.wallet.balance - this.total;
                this.userStateService.updateUserState(this.user);
              }
              this.blockedUI = false;
              this.cartRequest = undefined;
              this.isRefresh.emit(true);
            }
          },
          error: (error) => {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Thanh toán thất bại',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
            this.blockedUI = false;
            this.cartRequest = undefined;
          },
        });
      this.subscriptions.push(purchaseSub$);
    } else {
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
    }
  }

  checkBalanceEnough(): boolean {
    if (!this.user || !this.user.wallet) {
      return false;
    }
    return this.user.wallet.balance >= this.total;
  }
}
