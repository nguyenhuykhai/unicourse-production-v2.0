import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Subscription } from 'rxjs';
import { CouponService, DialogBroadcastService, UserStateService } from '../../../../common/services';
import { Helpers } from '../../../../cores/utils';
import { LANGUAGE } from '../../../../common/constants';
import { User, Wallet } from '../../../../common/models';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  loading: boolean = false;
  value: string = '';
  error: string = '';
  isVoucherInvalid: boolean = false;
  user: User | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly userStateService: UserStateService,
    private readonly couponService: CouponService,
    private readonly dialogBroadcastService: DialogBroadcastService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.value = '';
    this.error = '';
    this.loading = false;
    this.visible = false;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.value = '';
    this.error = '';
    this.loading = false;
    this.visible = false;
  }

  handleSubmitVoucher(): void {
    this.loading = true;
    if (!this.value || this.value === '') {
      this.error = 'Voucher không được để trống';
      this.loading = false;
      return;
    }

    if (this.value.length < 6) {
      this.error = 'Voucher không hợp lệ';
      this.loading = false;
      return;
    }

    const couponSubscription$ = this.couponService.increaseCouponCount(this.value).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.loading = false;
          this.value = '';
          this.error = '';
          this.initNewCoin(res.data);
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Bạn đã nạp voucher thành công',
            type: 'success',
            return: false,
            numberBtn: 1,
          });
          this.hide();
        }
      },
      error: (error) => {
        this.error = Helpers.getErrorMessage(error.error.code, LANGUAGE.VI);
        this.loading = false;
      },
    });

    this.subscriptions.push(couponSubscription$);
  }

  private initNewCoin(data: Wallet): void {
    this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
    if (this.user) {
      this.user.wallet = data;
      this.userStateService.updateUserState(this.user);
      localStorage.setItem('UserInfo', JSON.stringify(this.user));
    }
  }
}
