import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { LOGO_FOOTER } from '../../../assets';
import { Issue } from './core';
import { FeedbackIssueObject } from '../../common/models';
import { FeedbackService } from '../../common/services/feedback.service';
import { DialogBroadcastService } from '../../common/services';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
})
export class ContactPageComponent implements OnInit, AfterViewInit, OnDestroy {
  public LOGO = LOGO_FOOTER;
  feedbackIssue: FeedbackIssueObject = {
    fullName: '',
    email: '',
    phone: '',
    category: '',
    content: '',
  };
  public issues: Issue[] = [];
  selectedIssue: Issue | undefined;

  // BEHAVIOR VARIABLES
  blockedUI: boolean = false;

  timeoutId: any;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private feedbackService: FeedbackService,
    private dialogBroadcastService: DialogBroadcastService
  ) {}

  ngOnInit() {
    this.issues = [
      { name: 'Vấn đề thanh toán', code: 'payment' },
      { name: 'Hợp tác', code: 'collaboration' },
      { name: 'Vấn đề khác', code: 'other' },
    ];
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Use AfterViewInit to ensure DOM is fully loaded
      this.timeoutId = setTimeout(() => {
        this.scrollToTarget();
        clearTimeout(this.timeoutId); // Clear the timeout after task is executed
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  sendFeedbackIssue() {
    if (this.blockedUI || !this.feedbackIssue) {
      return;
    }

    if (!this.validateFeedbackIssue()) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Vui lòng nhập đầy đủ thông tin',
        type: 'error',
        return: false,
        numberBtn: 1,
      });
      return;
    }

    this.blockedUI = true;
    const sendFeedbackIssue$ = this.feedbackService
      .postFeedbackIssue(this.feedbackIssue)
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message:
                'Gửi phản hồi thành công, chúng tôi sẽ phản hồi bạn sớm nhất có thể',
              type: 'success',
              return: false,
              numberBtn: 1,
            });
            this.feedbackIssue = {
              fullName: '',
              email: '',
              phone: '',
              category: '',
              content: '',
            }
            this.selectedIssue = undefined;
            this.blockedUI = false;
          }
        },
        error: (err) => {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Gửi phản hồi thất bại, vui lòng thử lại sau',
            type: 'error',
            return: false,
            numberBtn: 1,
          });
          this.feedbackIssue = {
            fullName: '',
            email: '',
            phone: '',
            category: '',
            content: '',
          }
          this.selectedIssue = undefined;
          this.blockedUI = false;
        },
      });
    this.subscriptions.push(sendFeedbackIssue$);
  }

  validateFeedbackIssue(): boolean {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/g;
    if (!this.feedbackIssue.fullName) {
      return false;
    }

    if (!this.feedbackIssue.email) {
      return false;
    }

    if (!this.feedbackIssue.phone || !phoneRegex.test(this.feedbackIssue.phone)) {
      return false;
    }

    if (!this.selectedIssue) {
      return false;
    }
    this.feedbackIssue.category = this.selectedIssue.name;

    if (!this.feedbackIssue.content) {
      return false;
    }

    return true;
  }

  scrollToTarget() {
    const targetElement = document.getElementById('targetDiv');
    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200; // Adjust this value as necessary
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
