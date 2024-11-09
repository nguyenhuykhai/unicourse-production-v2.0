import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProfileDialog } from '../../core/models';
import { User } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-social-info',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './social-info.component.html',
  styleUrl: './social-info.component.scss',
})
export class SocialInfoComponent {
  @Output() openDialogRequest = new EventEmitter<ProfileDialog>();
  @Input() blockedUI!: boolean;
  @Input() user: User | undefined;
  dialogData!: ProfileDialog;

  // Method to request opening the dialog
  requestOpenDialog(enumType: string) {
    switch (enumType) {
      case 'edit-website':
        this.dialogData = {
          header: 'Trang web cá nhân',
          description:
            'Địa chỉ trang web cá nhân sẽ được hiển thị trên trang cá nhân của bạn. Ví dụ: https://example.com',
          label: 'Trang web cá nhân',
          placeholder: 'Nhập trang web cá nhân của bạn',
          value: this.user?.self_intro_url,
          type: 'text',
          required: false,
          field: 'self_intro_url',
        };
        break;
      case 'edit-github':
        this.dialogData = {
          header: 'GitHub',
          description:
            'Địa chỉ GitHub sẽ được hiển thị trên trang cá nhân của bạn. Ví dụ: https://github.com/username',
          label: 'Trang GitHub',
          placeholder: 'Nhập đường dẫn trang GitHub của bạn',
          value: this.user?.github_url,
          type: 'text',
          required: false,
          field: 'github_url',
        };
        break;
      case 'edit-linkedin':
        this.dialogData = {
          header: 'Hồ sơ LinkedIn',
          description:
            'Địa chỉ LinkedIn sẽ được hiển thị trên trang cá nhân của bạn. Ví dụ: https://linkedin.com/in/username.',
          label: 'Hồ sơ LinkedIn',
          placeholder: 'Nhập đường dẫn hồ sơ LinkedIn của bạn',
          value: this.user?.linkedin_url,
          type: 'text',
          required: false,
          field: 'linkedin_url',
        };
        break;
      case 'edit-facebook':
        this.dialogData = {
          header: 'Trang cá nhân Facebook',
          description:
            'Địa chỉ Facebook sẽ được hiển thị trên trang cá nhân của bạn. Ví dụ: https://facebook.com/username.',
          label: 'Trang cá nhân',
          placeholder: 'Nhập đường dẫn trang cá nhân của bạn',
          value: this.user?.facebook_url,
          type: 'text',
          required: false,
          field: 'facebook_url',
        };
        break;
      default:
        break;
    }

    this.openDialogRequest.emit(this.dialogData);
  }
}
