import { Component, AfterViewInit, Renderer2, OnInit } from '@angular/core';
import { PaymentService } from '../../common/services/payment.service';
import { SharedModule } from '../../shared/shared.module';
import { DialogBroadcastService, UserStateService } from '../../common/services';
import { CreatePaymentLink, InfoPaymentLink, PaymentLink, PaymentStatus, User } from '../../common/models';
import { Subscription } from 'rxjs';
import { usePayOS, PayOSConfig } from 'payos-checkout'; // Import usePayOS from PayOSCheckout
import { In } from '@lordicon/element';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-wallet-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './wallet-page.component.html',
  styleUrls: ['./wallet-page.component.scss'],
})
export class WalletPageComponent implements OnInit, AfterViewInit {
  public blockedUI: boolean | undefined;
  coinAmount: number = 0;
  payOS: any;
  paymentStatus: PaymentStatus | undefined;
  user: User | undefined;
  private RETURN_URL = `${window.location.href}`;
  private CANCEL_URL = `${window.location.href}`;
  private subscriptions: Subscription[] = [];

  constructor(
    private paymentService: PaymentService,
    private renderer: Renderer2,
    private dialogBroadcastService: DialogBroadcastService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = localStorage.getItem('UserInfo')
        ? JSON.parse(localStorage.getItem('UserInfo') || '{}')
        : undefined;
      // Initialize the service with the current user
      this.userStateService.updateUserState(this.user);
    }
  }

  ngAfterViewInit() {
    this.loadPayOSScript();
  }

  loadPayOSScript() {
    const script = this.renderer.createElement('script');
    script.src =
      'https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js';
    script.onload = () => {
      console.log('PayOS script loaded successfully');
    };
    this.renderer.appendChild(document.body, script);
  }

  initPayOS(checkoutResponse: PaymentLink) {
    const payOSConfig: PayOSConfig = {
      RETURN_URL: this.RETURN_URL,
      ELEMENT_ID: 'config_root',
      CHECKOUT_URL: checkoutResponse.checkoutUrl,
      onExit: (eventData: any) => {
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Thông báo',
          message: 'Thanh toán đã bị hủy',
          type: 'info',
          return: false,
          numberBtn: 1,
        });
        this.paymentStatus = undefined;
        this.coinAmount = 0;
      },
      onSuccess: (eventData: any) => {
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Thông báo',
          message: 'Thanh toán thành công',
          type: 'success',
          return: false,
          numberBtn: 1,
        });
        // this.paymentStatus = eventData;
        // this.handleGetPaymentInfoAndUpdate(eventData);
        const updatedUser: User = cloneDeep(this.user!);
        if (updatedUser.wallet) {
          updatedUser.wallet.balance += this.coinAmount;
          localStorage.setItem('UserInfo', JSON.stringify(updatedUser));
          this.userStateService.updateUserState(updatedUser);
        }
        this.coinAmount = 0;
      },
      onCancel: (eventData: any) => {
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Thông báo',
          message: 'Thanh toán đã bị hủy',
          type: 'info',
          return: false,
          numberBtn: 1,
        });
        this.paymentStatus = eventData;
        this.handleGetPaymentInfoAndUpdate(eventData);
        this.coinAmount = 0;
      },
    };

    const payOS = usePayOS(payOSConfig);
    this.payOS = payOS;
    payOS.open();
  }

  createPaymentLink() {
    if (this.coinAmount < 1000) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Số tiền nạp tối thiểu là 2000 VNĐ',
        type: 'info',
        return: false,
        numberBtn: 1,
      });
      return;
    }

    const paymentData: CreatePaymentLink = {
      amount: this.coinAmount,
      description: `Nạp ${this.coinAmount} xu vào ví`,
      cancelUrl: this.CANCEL_URL,
      returnUrl: this.RETURN_URL,
      payment_method_id: 1,
    };

    this.blockedUI = true;
    const paymentSub$ = this.paymentService
      .createPayOSLink(paymentData)
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.blockedUI = false;
            this.initPayOS(res.data);
          }
        },
        error: (error) => {
          this.blockedUI = false;
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Tạo link thanh toán thất bại',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(paymentSub$);
  }

  handleGetPaymentInfoAndUpdate(data: PaymentStatus) {
    switch (data.status) {
      case 'PAID':
        // const getPaymentInfoSub$ = this.paymentService
        //   .getPaymentLink(data.orderCode)
        //   .subscribe({
        //     next: (res) => {
        //       if (res.status === 200) {
        //         this.updatePaymentInfo(res.data);
        //       }
        //     },
        //     error: (error) => {
        //       this.dialogBroadcastService.broadcastConfirmationDialog({
        //         header: 'Thông báo',
        //         message: 'Lấy thông tin thanh toán thất bại',
        //         type: 'error',
        //         return: false,
        //         numberBtn: 1,
        //       });
        //     },
        //   });
        // this.subscriptions.push(getPaymentInfoSub$);
        break;
      case 'CANCELLED':
        const cancelPaymentSub$ = this.paymentService
          .cancelPaymentLink(data.orderCode)
          .subscribe({
            next: (res) => {},
            error: (error) => {
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Lấy thông tin thanh toán thất bại',
                type: 'error',
                return: false,
                numberBtn: 1,
              });
            },
          });
        this.subscriptions.push(cancelPaymentSub$);
        break;
      default:
        break;
    }
  }

  updatePaymentInfo(data: InfoPaymentLink) {
    const updatePaymentInfoSub$ = this.paymentService
      .updatePaymentInfo(data)
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Cập nhật thông tin thanh toán thành công',
              type: 'success',
              return: false,
              numberBtn: 1,
            });
          }
        },
        error: (error) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Cập nhật thông tin thanh toán thất bại',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(updatePaymentInfoSub$);
  }
}