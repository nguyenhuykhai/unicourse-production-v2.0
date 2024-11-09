import { Component, Input, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { DialogBroadcastService, SharedService } from '../../../../common/services';
import { DangerZoneService } from './core/services';
import { Subscription } from 'rxjs';
import { ConfirmOTP, StepCloseAccount } from './core/models';
import { User } from '../../../../common/models';
import { AuthService } from '../../../../shared/layouts/default-layout/sign-in-form-dialog/core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-danger-zone',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './danger-zone.component.html',
  styleUrl: './danger-zone.component.scss',
})
export class DangerZoneComponent implements OnDestroy {
  @Input() user: User | undefined;
  step: string = StepCloseAccount.INITIATE_ACCOUNT_CLOSURE;
  value: string | undefined;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly dangerZoneService: DangerZoneService,
    private readonly authService: AuthService,
    private router: Router,
    private dialogBroadcastService: DialogBroadcastService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  handleInitiateAccountClosure() {
    const closureSubscription = this.dangerZoneService
      .postInitiateAccountClosure()
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Đóng tài khoản',
              message: 'Một mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để xác nhận đóng tài khoản',
              type: 'info',
              return: true,
              numberBtn: 1,
            });
            this.step = StepCloseAccount.CONFIRM_ACCOUNT_CLOSURE;
          } else {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Đóng tài khoản',
              message: 'Đóng tài khoản không thành công',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
          }
        },
        error: (err) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Đóng tài khoản',
            message: 'Đóng tài khoản không thành công',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(closureSubscription);
  }

  handleCompleteAccountClosure() {
    if (!this.value || !this.user?.email) {
      return;
    }

    const body: ConfirmOTP = {
      email: this.user.email,
      otp: this.value,
    };
    const closureSubscription = this.dangerZoneService
      .postCompleteAccountClosure(body)
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Đóng tài khoản',
              message: 'Đóng tài khoản thành công',
              type: 'success',
              return: true,
              numberBtn: 1,
            });
            this.logout();
          } else {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Đóng tài khoản',
              message: 'Đóng tài khoản không thành công',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
          }
        },
        error: (err) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Đóng tài khoản',
            message: 'Đóng tài khoản không thành công',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
        },
      });
    this.subscriptions.push(closureSubscription);
  }

  logout() {
    this.authService.doLogout();
    // Đăng xuất thì xóa hết dữ liệu trong localStorage
    localStorage.clear();
    this.user = undefined;
    this.router.navigate(['/']);
    window.location.reload();
  }

  handleCancelAccountClosure() {
    this.step = StepCloseAccount.INITIATE_ACCOUNT_CLOSURE;
    this.value = undefined;
  }
}
