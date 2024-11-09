import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import {
  FileUploadHandlerEvent,
  FileUpload as FileUploadPrime,
} from 'primeng/fileupload';
import {
  BlogPayload,
  Category,
  FileUpload,
  ToastObject,
} from '../../../common/models';
import { FileUploadService } from '../../../common/services';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-publish-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './publish-dialog.component.html',
  styleUrl: './publish-dialog.component.scss',
  providers: [MessageService],
})
export class PublishDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploader') fileUploader: FileUploadPrime | undefined;
  @Output() data = new EventEmitter<BlogPayload>();
  @Output() closeDialog = new EventEmitter<void>();
  @Input() blogPayload: BlogPayload | undefined;
  @Input() categories: Array<Category> | undefined;
  selectedCategories: Array<Category> = [];
  blockedUI = false;

  // Biến upload file
  selectedFile?: any;
  currentFileUpload!: FileUpload;
  imageUrl: string | undefined;

  // Biến behavior cho AvatarUploadComponent
  disableSubmitBtn!: boolean;
  percentage = 0;

  // Biến cục bộ
  private subscriptions: Subscription[] = [];

  constructor(
    private fileUploadService: FileUploadService,
    private messageService: MessageService,
    private ngZone: NgZone
  ) {}

  // INITIALIZATION ZONE
  ngOnInit(): void {
    this.disableSubmitBtn = true;
    this.imageUrl = undefined;
    if (this.blogPayload) {
      this.blogPayload.invalid_min_read = true;
      this.blogPayload.invalid_description = true;
      this.blogPayload.invalid_categories_id = true;
    }
  }

  ngOnDestroy(): void {
    this.blockedUI = false;
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // LOGIC ZONE
  handleCreateNewPost(): void {
    if (this.blockedUI) return;

    this.ngZone.run(() => {
      this.blockedUI = true;
      if (this.blogPayload) {
        const isValidData: boolean = this.validateForm();

        if (!isValidData) return;
        this.clearDataValidateForSubmit();

        this.blogPayload.categories_id = this.selectedCategories.map(
          (category) => category.id
        );

        if (this.selectedFile) {
          this.upload(this.selectedFile);
          this.blockedUI = false;
          this.disableSubmitBtn = false;
        } else {
          this.blogPayload.thumbnail_url =
            'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/images%2Fplaceholder.webp?alt=media&token=8cf5b6e0-a14a-40f2-a843-10c3cc6846c8';
          this.data.emit(this.blogPayload);
          this.blockedUI = false;
          this.disableSubmitBtn = false;
        }
      }
    });
  }

  // Validate each data
  validateData(value: any, type: string): boolean {
    switch (type) {
      case 'title':
        this.ngZone.run(() => {
          if (this.blogPayload) {
            if (value && value.trim() !== '') {
              this.blogPayload.error_title = undefined;
              this.blogPayload.invalid_title = false;
            } else {
              this.blogPayload.error_title = 'Tiêu đề không được để trống';
              this.blogPayload.invalid_title = true;
            }
          }
        });

        return value && value.trim() !== '';
      case 'description':
        this.ngZone.run(() => {
          if (this.blogPayload) {
            if (value && value.trim() !== '') {
              this.blogPayload.error_description = undefined;
              this.blogPayload.invalid_description = false;
            } else {
              this.blogPayload.error_description = 'Mô tả không được để trống';
              this.blogPayload.invalid_description = true;
            }
          }
        });

        return value && value.trim() !== '';
      case 'categories':
        if (!this.selectedCategories) {
          this.ngZone.run(() => {
            if (this.blogPayload) {
              if (value && value.trim() !== '') {
                this.blogPayload.error_categories_id = undefined;
                this.blogPayload.invalid_categories_id = false;
              } else {
                this.blogPayload.error_categories_id =
                  'Vui lòng chọn ít nhất một danh mục';
                this.blogPayload.invalid_categories_id = true;
              }
            }
          });

          return false;
        }

        if (this.selectedCategories && this.selectedCategories.length === 0) {
          this.ngZone.run(() => {
            if (this.blogPayload) {
              this.blogPayload.error_categories_id =
                'Vui lòng chọn ít nhất một danh mục';
              this.blogPayload.invalid_categories_id = true;
            }
          });

          return false;
        }

        if (this.selectedCategories && this.selectedCategories.length > 5) {
          this.ngZone.run(() => {
            if (this.blogPayload) {
              this.blogPayload.error_categories_id =
                'Chỉ được chọn tối đa 5 danh mục';
              this.blogPayload.invalid_categories_id = true;
            }
          });

          return false;
        }

        this.ngZone.run(() => {
          if (this.blogPayload) {
            this.blogPayload.error_categories_id = undefined;
            this.blogPayload.invalid_categories_id = false;
          }
        });
        return true;
      case 'min_read':
        this.ngZone.run(() => {
          if (this.blogPayload) {
            if (
              this.blogPayload.min_read &&
              this.blogPayload.min_read > 0 &&
              this.blogPayload.min_read <= 100
            ) {
              this.blogPayload.error_min_read = undefined;
              this.blogPayload.invalid_min_read = false;
            } else {
              this.blogPayload.error_min_read = 'Thời gian đọc không hợp lệ';
              this.blogPayload.invalid_min_read = true;
            }
          }
        });

        return this.blogPayload &&
          this.blogPayload.min_read &&
          this.blogPayload.min_read > 0 &&
          this.blogPayload.min_read <= 100
          ? true
          : false;
      default:
        return false;
    }
  }

  // Validate form
  validateForm(): boolean {
    if (!this.blogPayload) return false;

    const titleValid = this.validateData(this.blogPayload.title, 'title');
    const descriptionValid = this.validateData(
      this.blogPayload.description,
      'description'
    );
    const categoriesValid = this.validateData(
      this.selectedCategories,
      'categories'
    );
    const minReadValid = this.validateData(
      this.blogPayload.min_read,
      'min_read'
    );

    this.disableSubmitBtn = !(
      titleValid &&
      descriptionValid &&
      categoriesValid &&
      minReadValid
    );
    return titleValid && descriptionValid && categoriesValid && minReadValid;
  }

  // BEHAVIOR LOGIC ZONE
  updateAvatar() {
    this.upload(this.selectedFile);
  }

  selectFile(event: FileUploadHandlerEvent): void {
    if (!event.files[0]) return;
    this.ngZone.run(() => {
      this.selectedFile = event.files[0];
      this.imageUrl =
        this.selectedFile.objectURL.changingThisBreaksApplicationSecurity;
    });
  }

  clear(): void {
    if (this.blockedUI) return;
    this.ngZone.run(() => {
      if (this.blogPayload) {
        this.selectedFile = undefined;
        this.fileUploader?.clear();
        this.blogPayload.description = '';
        this.blogPayload.min_read = 0;
        this.selectedCategories = [];
        this.blogPayload.invalid_categories_id = true;
        this.blogPayload.invalid_description = true;
        this.blogPayload.invalid_min_read = true;
        this.blogPayload.error_categories_id = undefined;
        this.blogPayload.error_description = undefined;
        this.blogPayload.error_min_read = undefined;
        this.blogPayload.error_title = undefined;
        this.imageUrl = undefined;
      }
    });
    this.closeDialog.emit();
  }

  clearDataValidateForSubmit() {
    if (this.blogPayload) {
      this.blogPayload.invalid_title = undefined;
      this.blogPayload.invalid_categories_id = undefined;
      this.blogPayload.invalid_description = undefined;
      this.blogPayload.invalid_min_read = undefined;
      this.blogPayload.error_categories_id = undefined;
      this.blogPayload.error_description = undefined;
      this.blogPayload.error_min_read = undefined;
      this.blogPayload.error_title = undefined;
    }
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

    this.ngZone.run(() => {
      this.selectedFile = undefined;

      this.currentFileUpload = new FileUpload(file);
      // Generate file name hợp lệ và unique

      const sanitizedFileName = this.generateSanitizedFileName();
      this.currentFileUpload.path = '/Blog';
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
              this.imageUrl = res.downloadUrl;
              this.blogPayload
                ? (this.blogPayload.thumbnail_url = this.imageUrl)
                : null;
              this.blogPayload
                ? (this.blogPayload.path_thumbnail_url = `/Blog/${sanitizedFileName}`)
                : null;
              this.data.emit(this.blogPayload);
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
    });
  }

  // Generate file với tên unique
  generateSanitizedFileName(): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomString}`;
  }

  showToast(severity: any, summary: string, detail: string): void {
    this.messageService.add({
      key: 'tst',
      severity,
      summary,
      detail,
    });
  }
}
