import {
  ApplicationRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { User, Comment } from '../../../../common/models';
import { first, skip, Subscription, take } from 'rxjs';
import {
  DialogBroadcastService,
  SharedService,
  UserStateService,
} from '../../../../common/services';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { EditorModule } from '@tinymce/tinymce-angular';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-comment-sidebar',
  standalone: true,
  imports: [SharedModule, EditorModule],
  templateUrl: './comment-sidebar.component.html',
  styleUrl: './comment-sidebar.component.scss',
})
export class CommentSidebarComponent implements OnInit, OnDestroy {
  @ViewChild('reportOverplay') reportOverplay!: OverlayPanel;
  @Output() closeDialog = new EventEmitter<boolean>();
  @Output() addComment = new EventEmitter<string>();
  @Output() updateComment = new EventEmitter<Comment>();
  @Output() deleteCommentId = new EventEmitter<string>();
  @Input() comments: Array<Comment> | undefined;
  user: User | undefined;
  toggleEditor: boolean = false;
  isEditComment: boolean = false;
  editorContentComment: string = '';
  updateCommentContent: string = '';
  reportType: string = 'DEFAULT';
  currentReportComment: Comment | undefined;

  public subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userStateService: UserStateService,
    private applicationRef: ApplicationRef,
    private ngZone: NgZone,
    private dialogBroadcastService: DialogBroadcastService,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData() {
    const userSub$ = this.userStateService.getUserState().subscribe((user) => {
      if (user) {
        this.ngZone.run(() => {
          this.user = user;
        });
      } else {
        const userLocal = localStorage.getItem('UserInfo');
        if (userLocal) {
          this.ngZone.run(() => {
            this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
            this.userStateService.updateUserState(this.user);
          });
        }
      }
    });
    this.subscriptions.push(userSub$);
  }

  // LOGIC ZONE
  handleAddComment() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.editorContentComment || '';
    const textContent = tempElement.textContent || tempElement.innerText || '';
  
    if (textContent.trim() !== '') {
      // If the content is valid (not empty or spaces)
      this.addComment.emit(this.editorContentComment);
      this.editorContentComment = '';
      this.toggleEditor = false;
    } else {
      // Show warning dialog if the comment content is effectively empty
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Nội dung bình luận không được để trống',
        type: 'warning',
        return: false,
        numberBtn: 1,
      });
    }
  }


  handleEditComment() {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.updateCommentContent || '';
    const textContent = tempElement.textContent || tempElement.innerText || '';

    // Handle edit comment
    if (textContent.trim() !== '' && this.currentReportComment) {
      // If the content is valid (not empty or spaces)
      this.currentReportComment.content = this.updateCommentContent;
      this.updateComment.emit(this.currentReportComment);
      this.updateCommentContent = '';
      this.currentReportComment = undefined;
      this.isEditComment = false;
    } else {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Nội dung bình luận không được để trống',
        type: 'warning',
        return: false,
        numberBtn: 1,
      });
    }
  }

  toggleEditComment(isOpen: boolean) {
    this.reportOverplay.hide();
    isOpen ? (this.updateCommentContent = this.currentReportComment?.content || '') : (this.updateCommentContent = ''); 
    this.isEditComment = isOpen;
  }

  handleDeleteComment() {
    // Handle delete comment
    this.dialogBroadcastService.broadcastConfirmationDialog({
      header: 'Xác nhận',
      message: 'Bạn có chắc chắn muốn xóa bình luận này?',
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
          this.deleteCommentId.emit(this.currentReportComment?.id || '');
          this.currentReportComment = undefined;
          this.reportOverplay.hide();
        } else {
          this.currentReportComment = undefined;
          this.reportOverplay.hide();
        }
      });
  }

  handleReportComment() {
    // Handle report comment
    this.dialogBroadcastService.broadcastConfirmationDialog({
      header: 'Thông báo',
      message: 'Chức năng này đang được phát triển',
      type: 'info',
      return: false,
      numberBtn: 1,
    });
  }

  // BEHAVIOR ZONE
  // Close dialog for mobile size
  closeDialogForMobile() {
    this.closeDialog.emit(true);
  }

  // Toggle editor comment
  toggleEditorComment() {
    this.toggleEditor = !this.toggleEditor;
  }

  // Sanitize content
  sanitizeContent(content: any): any {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // Hanle time since publication
  publishedAtString(published_at: Date): string {
    const publishedAt: Date = new Date(published_at);
    const currentTime: Date = new Date();
    const timeDifference: number =
      currentTime.getTime() - publishedAt.getTime();
    const days: number = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours: number = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes: number = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return `vài giây trước`;
    }
  }

  // Toggle report dialog
  toggleReportOverPlay(event: Event, comment: Comment) {
    if (!this.user) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (comment.user.id === this.user.id) {
      this.reportType = 'USER_OWN_COMMENT';
    } else {
      this.reportType = 'DEFAULT';
    }

    this.currentReportComment = comment;
    this.reportOverplay.toggle(event);
  }
}
