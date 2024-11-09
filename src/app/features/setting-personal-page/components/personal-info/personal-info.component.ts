import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ProfileDialog } from '../../core/models';
import { User } from '../../../../common/models';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss',
})
export class PersonalInfoComponent {
  @Output() openDialogRequest = new EventEmitter<ProfileDialog>();
  @Input() blockedUI!: boolean;
  @Input() user: User | undefined;
  dialogData!: ProfileDialog;

  // Method to request opening the dialog
  requestOpenDialog(enumType: string): void {
    switch (enumType) {
      case 'edit-name':
        this.dialogData = {
          header: 'Cập nhật tên của bạn',
          description:
            'Tên sẽ được hiển thị trên trang cá nhân, trong các bình luận và bài viết của bạn.',
          label: 'Họ và tên',
          placeholder: 'Nhập họ và tên của bạn',
          value: this.user?.full_name,
          type: 'text',
          required: true,
          field: 'full_name',
        };
        break;
      case 'edit-introduce':
        this.dialogData = {
          header: 'Giới thiệu về bản thân',
          description:
            'Giới thiệu ngắn gọn về bản thân giúp mọi người hiểu rõ hơn về bạn.',
          label: 'Giới thiệu',
          placeholder: 'Nhập giới thiệu về bản thân',
          value: this.user?.bio,
          type: 'textarea',
          required: false,
          field: 'bio',
        };
        break;
      case 'edit-avatar':
        this.dialogData = {
          header: 'Ảnh đại diện',
          description:
            'Ảnh đại diện giúp mọi người nhận biết bạn dễ dàng hơn qua các bài viết, bình luận, tin nhắn...',
          label: 'Ảnh đại diện',
          placeholder: 'Ảnh đại diện',
          value: this.user?.profile_image,
          type: 'file',
          hint: 'Tải ảnh mới lên',
          required: true,
          field: 'profile_image',
        };
        break;
      case 'edit-address':
        this.dialogData = {
          header: 'Địa chỉ',
          description: 'Địa chỉ sẽ được hiển thị trên trang cá nhân của bạn.',
          label: 'Địa chỉ',
          placeholder: 'Nhập địa chỉ của bạn',
          value: this.user?.address,
          type: 'text',
          required: false,
          field: 'address',
        };
        break;
      case 'edit-phone':
        this.dialogData = {
          header: 'Số điện thoại',
          description:
            'Số điện thoại sẽ được hiển thị trên trang cá nhân của bạn.',
          label: 'Số điện thoại',
          placeholder: 'Nhập số điện thoại của bạn',
          value: this.user?.phone_num,
          type: 'text',
          required: false,
          field: 'phone_num',
        };
        break;
      default:
        break;
    }

    this.openDialogRequest.emit(this.dialogData);
    this.dialogData = {} as ProfileDialog;
  }
}
