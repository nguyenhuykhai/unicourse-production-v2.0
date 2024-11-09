import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ProfileDialog } from '../../core/models';
import { User } from '../../../../common/models';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss',
})
export class SecuritySettingsComponent {
  @Output() openDialogRequest = new EventEmitter<ProfileDialog>();
  @Input() blockedUI!: boolean;
  @Input() user: User | undefined;
  dialogData!: ProfileDialog;

  checkAccountIsHavePassword(): boolean {
    return this.user?.hashed_password ? true : false;
  }

  // Method to request opening the dialog
  requestOpenDialog(enumType: string): void {
    switch (enumType) {
      case 'edit-password':
        this.dialogData = {
          header: 'Đổi mật khẩu',
          description:
            'Mật khẩu của bạn phải có tối thiểu 8 ký tự, bao gồm cả chữ số, chữ cái và ký tự đặc biệt (!$@%...).',
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          type: 'edit-password',
          required: true,
          field: 'password',
        };
        break;
      case 'add-password':
        this.dialogData = {
          header: 'Thêm mật khẩu',
          description:
            'Mật khẩu của bạn phải có tối thiểu 8 ký tự, bao gồm cả chữ số, chữ cái và ký tự đặc biệt (!$@%...).',
          newPassword: '',
          type: 'add-password',
          required: true,
          field: 'password',
        };
        break;
      default:
        break;
    }

    this.openDialogRequest.emit(this.dialogData);
    this.dialogData = {} as ProfileDialog;
  }
}
