import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { DialogBroadcastService } from '../../../../common/services';
import { FileUploadService } from '../../../../common/services'; // Import the FileUploadService
import { FileUpload, ToastObject, User } from '../../../../common/models'; // Import FileUpload model if needed
import {
  FileUploadHandlerEvent,
  FileUpload as FileUploadPrime,
} from 'primeng/fileupload';
import { ProfileDialog } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss',
})
export class AvatarUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploader') fileUploader: FileUploadPrime | undefined;
  @Output() toastObject = new EventEmitter<ToastObject>();
  @Output() data = new EventEmitter<ProfileDialog>();
  @Input() user: User | undefined;

  // Biến upload file
  @Output() isUploadToFireBase = new EventEmitter<ProfileDialog | undefined>();
  selectedFile?: any;
  currentFileUpload!: FileUpload;
  imageUrl: string | undefined;

  // Biến behavior cho AvatarUploadComponent
  disableSubmitBtn!: boolean;
  percentage = 0;

  // Biến cục bộ
  private subscriptions: Subscription[] = [];

  constructor(private fileUploadService: FileUploadService) {}

  // INITIALIZATION ZONE
  ngOnInit(): void {
    this.disableSubmitBtn = true;
    this.imageUrl = this.user?.profile_image
      ? this.user.profile_image
      : 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/User%2Fdefault-avatar.png?alt=media&token=e9ad363c-de79-4457-9fa5-1864a911c686';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // BEHAVIOR LOGIC ZONE
  showToast(severity: any, summary: string, detail: string): void {
    this.toastObject.emit({ severity, summary, detail });
  }

  // UPLOAD FILE LOGIC ZONE
  updateAvatar() {
    this.upload(this.selectedFile);
  }

  selectFile(event: FileUploadHandlerEvent): void {
    if (!event.files[0]) return;
    this.selectedFile = event.files[0];
    this.imageUrl =
      this.selectedFile.objectURL.changingThisBreaksApplicationSecurity;
    this.disableSubmitBtn = false;
  }

  // Upload này config cho viêc upload ảnh thumbnail của course
  upload(file: File): void {
    if (!file) {
      this.showToast(
        'error',
        'Chưa chọn ảnh',
        'Vui lòng chọn ảnh trước khi upload'
      );
      return;
    }

    this.selectedFile = undefined;

    this.currentFileUpload = new FileUpload(file);
    // Generate file name hợp lệ và unique

    const sanitizedFileName = this.generateSanitizedFileName();
    this.currentFileUpload.path = '/User';
    this.currentFileUpload.name = sanitizedFileName;
    this.fileUploadService
      .pushFileToStorage(
        this.currentFileUpload.name,
        this.currentFileUpload.path,
        this.currentFileUpload
      )
      .subscribe({
        next: (res) => {
          if (res.downloadUrl !== '') {
            this.showToast(
              'success',
              'Upload ảnh thành công',
              'Ảnh đã được lưu trữ'
            );
            this.imageUrl = res.downloadUrl;
            this.data.emit({
              header: 'Ảnh đại diện',
              description:
                'Ảnh đại diện giúp mọi người nhận biết bạn dễ dàng hơn qua các bài viết, bình luận, tin nhắn...',
              label: 'Ảnh đại diện',
              placeholder: 'Ảnh đại diện',
              value: this.imageUrl,
              type: 'file',
              hint: 'Tải ảnh mới lên',
              required: true,
              field: 'profile_image',
              optional: this.currentFileUpload,
            });
          } else {
            this.percentage = Math.round(res.percentUpload ?? 0);
            this.fileUploader?.clear();
          }
        },
        error: (err) => {
          this.showToast(
            'error',
            'Upload ảnh thất bại',
            'Vui lòng thử lại sau'
          );
        },
      });
  }

  cancelSubmit() {
    this.imageUrl = this.user?.profile_image;
    this.selectedFile = undefined;
  }

  // Generate file với tên unique
  generateSanitizedFileName(): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomString}`;
  }
}
