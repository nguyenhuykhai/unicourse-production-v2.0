import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { AvatarUploadComponent } from './components/avatar-upload/avatar-upload.component';
import { SocialInfoComponent } from './components/social-info/social-info.component';
import { ProfileDialog } from './core/models';
import { SETTING } from './constants';
import { DangerZoneComponent } from './components/danger-zone/danger-zone.component';
import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';
import { UserService } from '../../common/services/user.service';
import {
  BodyUpdateUser,
  Districts,
  Provinces,
  RequestUpdatePassword,
  ToastObject,
  User,
  Wards,
} from '../../common/models';
import { Subscription } from 'rxjs';
import {
  DialogBroadcastService,
  FileUploadService,
} from '../../common/services';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-setting-personal-page',
  standalone: true,
  imports: [
    SharedModule,
    AccountSettingsComponent,
    PersonalInfoComponent,
    AvatarUploadComponent,
    SocialInfoComponent,
    DangerZoneComponent,
    SecuritySettingsComponent,
  ],
  templateUrl: './setting-personal-page.component.html',
  styleUrl: './setting-personal-page.component.scss',
  providers: [MessageService],
})
export class SettingPersonalPageComponent implements OnInit, OnDestroy {
  public visible: boolean = false;
  public profileDialog!: ProfileDialog;
  public originalProfileDialog!: ProfileDialog;
  public settingTab: string = SETTING.PERSONAL_INFO;
  public blockedUI: boolean = true;
  user: User | undefined;
  updateProfile: BodyUpdateUser | undefined;

  // Normal error message
  error: string | undefined;
  // Error message for address
  errorCity: string | undefined;
  errorDistrict: string | undefined;
  errorWard: string | undefined;
  // Error message for password
  errorOldPassword: string | undefined;
  errorNewPassword: string | undefined;
  errorConfirmPassword: string | undefined;

  provinces: Array<Provinces> | undefined;
  selectedCity: Provinces | undefined;
  selectedDistrict: Districts | undefined;
  selectedWard: Wards | undefined;

  count: number = 0;

  private subscriptions: Subscription[] = [];

  // Flags to toggle password visibility
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly userService: UserService,
    private dialogBroadcastService: DialogBroadcastService,
    private ngZone: NgZone,
    private http: HttpClient,
    private messageService: MessageService // Inject MessageService for toast notifications
  ) {}

  ngOnInit() {
    this.initData();
    this.loadprovinces();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initData() {
    this.blockedUI = true;
    const userSubscription$ = this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.user = res.data;
          this.blockedUI = false;
        }
      },
      error: () => {
        this.blockedUI = false;
      },
    });

    this.subscriptions.push(userSubscription$);
  }

  loadprovinces() {
    this.http.get('assets/data/provinces.json').subscribe((data: any) => {
      this.provinces = data;
    });
  }

  openDialog(dialogData: ProfileDialog) {
    this.profileDialog = dialogData;
    this.originalProfileDialog = cloneDeep(dialogData);
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
    this.error = undefined;
    this.errorCity = undefined;
    this.errorDistrict = undefined;
    this.errorWard = undefined;
    this.errorOldPassword = undefined;
    this.errorNewPassword = undefined;
    this.errorConfirmPassword = undefined;
    this.originalProfileDialog = {} as ProfileDialog;
  }

  selectCity(province: Provinces) {
    if (!province) return;
    this.selectedCity = province;
    this.errorCity = undefined;
    this.selectedDistrict = undefined;
    this.selectedWard = undefined;
  }

  selectDistrict(district: Districts) {
    if (!this.selectedCity || !district) return;
    this.selectedDistrict = district;
    this.errorDistrict = undefined;
    this.selectedWard = undefined;
  }

  selectWard(ward: Wards) {
    if (!this.selectedCity || !this.selectedDistrict || !ward) return;
    this.selectedWard = ward;
    this.errorWard = undefined;
  }

  isFieldInvalid(data: ProfileDialog): boolean {
    if (data.required) {
      switch (data.field) {
        case 'full_name':
          if (!data.value || data.value.trim() === '') {
            this.error = 'Trường này không được để trống';
            return true;
          }
          if (data.value.length > 30) {
            this.error = 'Tên không được quá 30 ký tự';
            return true;
          }
          return false;
        case 'password':
          if (data.type === 'add-password') {
            return this.validateCreateNewPassword(data);
          } else {
            return this.validateUpdatePassword(data);
          }
        default:
          return !data.value || data.value.trim() === '';
      }
    } else {
      switch (data.field) {
        case 'bio':
          if (data.value && data.value.length > 500) {
            this.error = 'Giới thiệu không được quá 500 ký tự';
            return true;
          }
          return false;
        case 'phone_num':
          const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/g;
          if (data.value && !phoneRegex.test(data.value)) {
            this.error = 'Số điện thoại không hợp lệ';
            return true;
          }
          return false;
        default:
          return false;
      }
    }
  }

  handleUpdateProfile() {
    if (this.isFieldInvalid(this.profileDialog)) {
      this.error = 'Vui lòng nhập thông tin cần thiết';
      return;
    }
   
    if (
      this.originalProfileDialog.value?.trim() ===
        this.profileDialog.value?.trim() &&
      this.profileDialog.field !== 'password' && this.profileDialog.field !== 'address'
    ) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Không có thông tin nào thay đổi',
        type: 'info',
        return: false,
        numberBtn: 1,
      });
      return;
    }

    switch (this.profileDialog.field) {
      case 'address':
        this.handleUpdateAddress();
        break;
      case 'password':
        if (this.profileDialog.type === 'add-password') {
          this.handleAddNewPassword();
        } else {
          this.handleUpdatePassword();
        }
        break;
      default:
        this.callUpdateProfileService(this.profileDialog);
        break;
    }
  }

  handleUpdateAddress() {
    if (!this.selectedCity) {
      this.errorCity = 'Vui lòng chọn tỉnh/thành phố';
      return;
    }

    if (!this.selectedDistrict) {
      this.errorDistrict = 'Vui lòng chọn quận/huyện';
      return;
    }

    if (!this.selectedWard) {
      this.errorWard = 'Vui lòng chọn phường/xã';
      return;
    }

    this.errorCity = undefined;
    this.errorDistrict = undefined;
    this.errorWard = undefined;
    this.profileDialog.value = `${this.selectedWard.name}, ${this.selectedDistrict.name}, ${this.selectedCity.name}`;
    this.callUpdateProfileService(this.profileDialog);
  }

  handleAddNewPassword() {
    this.profileDialog.field = 'hashed_password';
    this.profileDialog.value = this.profileDialog.newPassword;
    this.callUpdateProfileService(this.profileDialog);
  }

  handleUpdatePassword() {
    const body: RequestUpdatePassword = {
      old_password: this.profileDialog.oldPassword,
      new_password: this.profileDialog.newPassword,
      confirm_password: this.profileDialog.confirmPassword
    };

    const changePasswordSub$ = this.userService.changePassword(body).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Đổi mật khẩu thành công',
            type: 'success',
            return: true,
            numberBtn: 1,
          });
          this.closeDialog();
        }
      },
      error: () => {
        this.errorOldPassword = 'Mật khẩu cũ không đúng';
      },
    });
    this.subscriptions.push(changePasswordSub$);
  }

  callUpdateProfileService(data: ProfileDialog) {
    this.updateProfile = { [data.field]: data.value };
    const updateProfileSub$ = this.userService
      .updateUserProfile(this.updateProfile)
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            if (data.field === 'profile_image') {
              const newUser = { ...this.user, profile_image: data.value };
              localStorage.setItem('UserInfo', JSON.stringify(newUser));
              window.location.reload();
            } else {
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Cập nhật thông tin thành công',
                type: 'success',
                return: true,
                numberBtn: 1,
              });
              this.initData();
              this.closeDialog();
            }
          }
        },
        error: () => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Lỗi',
            message: 'Cập nhật thông tin không thành công',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
          if (data.field === 'profile_image') {
            this.deleteImage(data.optional);
          }
        },
      });

    this.subscriptions.push(updateProfileSub$);
  }

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'oldPassword':
        this.showOldPassword = !this.showOldPassword;
        break;
      case 'newPassword':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirmPassword':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  deleteImage(file: any) {
    this.fileUploadService.deleteFile('/User', file);
  }

  // LOGIC ZONE
  validateCreateNewPassword(data: ProfileDialog): boolean {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!$@%]).{8,}$/g;

    if (!data.newPassword || data.newPassword.trim() === '') {
      this.errorNewPassword = 'Trường này không được để trống';
      return true;
    }

    this.errorNewPassword = undefined;
    if (!data.confirmPassword || data.confirmPassword.trim() === '') {
      this.errorConfirmPassword = 'Trường này không được để trống';
      return true;
    }

    this.errorConfirmPassword = undefined;
    if (data.newPassword !== data.confirmPassword) {
      this.errorConfirmPassword = 'Mật khẩu không khớp';
      return true;
    }

    this.errorConfirmPassword = undefined;
    if (data.newPassword && !passwordRegex.test(data.newPassword)) {
      this.errorNewPassword =
        'Mật khẩu của bạn phải có tối thiểu 8 ký tự, bao gồm cả chữ số, chữ cái và ký tự đặc biệt (!$@%...)';
      return true;
    }

    this.errorNewPassword = undefined;
    return false;
  }

  validateUpdatePassword(data: ProfileDialog): boolean {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!$@%]).{8,}$/g;
    if (!data.oldPassword || data.oldPassword.trim() === '') {
      this.errorOldPassword = 'Trường này không được để trống';
      return true;
    }

    this.errorOldPassword = undefined;
    if (!data.newPassword || data.newPassword.trim() === '') {
      this.errorNewPassword = 'Trường này không được để trống';
      return true;
    }

    this.errorNewPassword = undefined;
    if (!data.confirmPassword || data.confirmPassword.trim() === '') {
      this.errorConfirmPassword = 'Trường này không được để trống';
      return true;
    }

    this.errorConfirmPassword = undefined;
    if (data.newPassword !== data.confirmPassword) {
      this.errorConfirmPassword = 'Mật khẩu không khớp';
      return true;
    }

    this.errorConfirmPassword = undefined;
    if (data.newPassword && !passwordRegex.test(data.newPassword)) {
      this.errorNewPassword =
        'Mật khẩu của bạn phải có tối thiểu 8 ký tự, bao gồm cả chữ số, chữ cái và ký tự đặc biệt (!$@%...)';
      return true;
    }

    this.errorNewPassword = undefined;
    return false;
  }

  // BEHAVIOR LOGIC ZONE
  showToast(event: ToastObject): void {
    this.messageService.add({
      key: 'tst',
      severity: event.severity,
      summary: event.summary,
      detail: event.detail,
    });
  }

  handleChangeTab(tab: string) {
    this.settingTab = tab;
  }
}
