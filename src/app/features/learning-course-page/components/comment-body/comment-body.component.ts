import {
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { TopicComment, TopicCommentRequest } from '../../core/models';
import { Topic, User } from '../../../../common/models';
import { Subscription } from 'rxjs';
import {
  DialogBroadcastService,
  SharedService,
  UserStateService,
} from '../../../../common/services';
import { DomSanitizer } from '@angular/platform-browser';
import { OverlayPanel } from 'primeng/overlaypanel';
import { isPlatformBrowser } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { TopicCommentService } from '../../core/services';
import { Helpers } from '../../../../common/utils';

@Component({
  selector: 'app-comment-body',
  standalone: true,
  imports: [SharedModule, EditorModule],
  templateUrl: './comment-body.component.html',
  styleUrl: './comment-body.component.scss',
})
export class CommentBodyComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('reportOverplay') reportOverplay!: OverlayPanel;
  @Output() closeDialog = new EventEmitter<boolean>();
  @Output() addComment = new EventEmitter<TopicCommentRequest>();
  @Output() updateComment = new EventEmitter<Comment>();
  @Output() deleteCommentId = new EventEmitter<string>();
  @Input() currentTopic: Topic | undefined;
  @Input() comments: Array<TopicComment> | undefined;
  @Input() blockedUI: boolean | undefined;
  @Input() preventEventComment: boolean | undefined;
  @Input() requestFetchChildren: TopicComment | undefined;
  user: User | undefined;
  reportType: string = 'DEFAULT';
  currentReportComment: TopicComment | undefined;

  // CREATE NEW COMMENT
  toggleEditor: boolean = false;
  editorContentComment: string = '';

  // EDIT COMMENT
  updateCommentContent: string = '';
  isEditComment: boolean = false;

  // REPLY COMMENT
  toggleReply: boolean = false;
  commentReply: TopicComment | undefined;
  editorContentReply: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userStateService: UserStateService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private sharedService: SharedService,
    private dialogBroadcastService: DialogBroadcastService,
    private readonly topicCommentService: TopicCommentService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initUserData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['comments'] && changes['blockedUI']) {
      this.ngZone.run(() => {
        this.comments = changes['comments'].currentValue;
        this.blockedUI = changes['blockedUI'].currentValue;
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  initUserData(): void {
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

  handleReplyComment(item: TopicComment): void {
    if (!this.currentTopic || this.preventEventComment) {
      return;
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.editorContentReply || '';
    const textContent = tempElement.textContent || tempElement.innerText || '';
    if (textContent.trim() !== '') {
      this.preventEventComment = true;
      const replyCommentSub$ = this.topicCommentService
        .addTopicComment({
          content: this.editorContentReply,
          topic_id: this.currentTopic.id,
          parent_comment_id: item.parent_comment_id
            ? item.parent_comment_id
            : item.id,
          sub_comment_id: item.parent_comment_id ? item.id : undefined,
          url_link: Helpers.getPathFromUrl(window.location.href),
        })
        .subscribe({
          next: (res) => {
            if (res.status === 201) {
              this.ngZone.run(() => {
                if (!item.parent_comment_id) {
                  this.fetchChildren(item);
                } else {
                  const parent_comment = this.comments?.find((comment) => comment.id === item.parent_comment_id);
                  parent_comment && this.fetchChildren(parent_comment);
                }
                this.editorContentReply = '';
                this.toggleReply = false;
                this.preventEventComment = false;
              });
            } else {
              this.editorContentReply = '';
              this.toggleReply = false;
              this.preventEventComment = false;
            }
          },
          error: (error) => {
            console.error('Error adding comment:', error);
            this.editorContentReply = '';
            this.toggleReply = false;
            this.preventEventComment = false;
          },
        });
      this.subscriptions.push(replyCommentSub$);
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

  fetchChildren(item: TopicComment): void {
    const fetchChildrenSub$ = this.topicCommentService
      .getReplies(item.id)
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.ngZone.run(() => {
              this.comments?.map((comment) => {
                if (comment.id === item.id) {
                  comment.children = res.data;
                  comment.numberOfReplies = res.data.length;
                }
              });
            });
          }
        },
        error: (error) => {
          console.error(error);
        },
      });
    this.subscriptions.push(fetchChildrenSub$);
  }

  // LOGIC ZONE
  handleAddComment() {
    if (this.preventEventComment) {
      return;
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.editorContentComment || '';
    const textContent = tempElement.textContent || tempElement.innerText || '';

    if (textContent.trim() !== '') {
      // If the content is valid (not empty or spaces)
      this.addComment.emit({
        content: this.editorContentComment,
      });
      this.editorContentComment = '';
      this.toggleEditor = false;
      this.commentReply = undefined;
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
    if (this.preventEventComment || this.blockedUI) {
      return;
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.updateCommentContent || '';
    const textContent = tempElement.textContent || tempElement.innerText || '';

    if (textContent.trim() !== '' && this.currentReportComment) {
      this.handleUpdateComment(this.updateCommentContent.trim(), this.currentReportComment.id);
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

  handleDeleteCommentBasedOnType() {
    // Handle delete comment
    if (this.currentReportComment?.parent_comment_id) {
      this.handleDeleteReplyComment(this.currentReportComment);
    } else {
      this.handleDeleteParentComment(this.currentReportComment);
    }

  }

  handleDeleteReplyComment(comment: TopicComment | undefined) {
    if (!comment || this.blockedUI || this.preventEventComment) {
      return;
    }

    this.preventEventComment = true;
    const deleteReplyCommentSub$ = this.topicCommentService.deleteReplyComment(comment.id).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.ngZone.run(() => {
            this.comments?.map((item) => {
              if (item.id === comment.parent_comment_id) {
                item.children = item.children?.filter(
                  (item) => item.id !== comment.id
                );
                item.numberOfReplies = item.children?.length || 0;
              }
            });
            this.currentReportComment = undefined;
            this.reportOverplay.hide();
            this.preventEventComment = false;
          });
        }
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.preventEventComment = false;
      },
    });
    this.subscriptions.push(deleteReplyCommentSub$);
  }

  handleDeleteParentComment(comment: TopicComment | undefined) {
    if (!comment || this.blockedUI || this.preventEventComment) {
      return;
    }

    this.preventEventComment = true;
    const deleteParentCommentSub$ = this.topicCommentService.deleteParentComment(comment.id).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.ngZone.run(() => {
            this.comments = this.comments?.filter(
              (item) => item.id !== comment.id
            );
            this.currentReportComment = undefined;
            this.reportOverplay.hide();
            this.preventEventComment = false;
          });
        }
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        this.preventEventComment = false;
      },
    });
    this.subscriptions.push(deleteParentCommentSub$);
  }

  handleUpdateComment(content: string, comment_id: string) {
    if (!content || !comment_id || this.blockedUI || this.preventEventComment) {
      return;
    }

    this.preventEventComment = true;
    const updateCommentSub$ = this.topicCommentService.updateComment(content, comment_id).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.ngZone.run(() => {
            if (this.currentReportComment?.parent_comment_id) {
              this.comments?.map((item) => {
                if (item.id === this.currentReportComment?.parent_comment_id) {
                  item.children?.map((item) => {
                    if (item.id === comment_id) {
                      item.content = content;
                    }
                  });
                }
              });
            } else {
              this.comments?.map((item) => {
                if (item.id === comment_id) {
                  item.content = content;
                }
              })
            }
            this.updateCommentContent = '';
            this.currentReportComment = undefined;
            this.isEditComment = false;
            this.preventEventComment = false;
          });
        }
      },
      error: (error) => {
        console.error('Error updating comment:', error);
      },
    });
    this.subscriptions.push(updateCommentSub$);
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
  toggleEditorComment() {
    if (this.preventEventComment) {
      return;
    }

    this.toggleEditor = !this.toggleEditor;
  }

  toggleReplyComment(comment: TopicComment) {
    if (this.preventEventComment && !comment) {
      return;
    }

    if (!this.toggleReply) {
      this.editorContentReply = '';
      this.commentReply = comment;
    } else {
      this.editorContentReply = '';
      this.commentReply = undefined;
    }

    this.toggleReply = !this.toggleReply;
  }

  toggleEditComment(isOpen: boolean) {
    this.reportOverplay.hide();
    isOpen
      ? (this.updateCommentContent = this.currentReportComment?.content || '')
      : (this.updateCommentContent = '');
    this.isEditComment = isOpen;
  }

  sanitizeContent(content: any): any {
    if (!content) {
      return '';
    }

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  closeDialogForMobile() {
    this.closeDialog.emit(true);
  }

  // Hanle time since publication
  publishedAtString(published_at: string): string {
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
  toggleReportOverPlay(event: Event, comment: TopicComment) {
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
