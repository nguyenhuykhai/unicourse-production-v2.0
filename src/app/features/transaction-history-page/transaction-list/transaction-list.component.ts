import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgZone,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { Table } from 'primeng/table';
import { PayLoadTransactionHistory, TransactionHistory } from '../core/models';
import { Filter, User } from '../../../common/models';
import { Subscription } from 'rxjs';
import {
  DialogBroadcastService,
  UserStateService,
} from '../../../common/services';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { cloneDeep } from 'lodash'
import { FeedbackObject } from './core/models';
import { OverlayPanel } from 'primeng/overlaypanel';
import { FeedbackService } from '../../../common/services/feedback.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TransactionListComponent {
  @ViewChild('dt2') table!: Table;
  @ViewChild('feedbackOverplay') feedbackOverplay!: OverlayPanel;
  @Input() payloadTransactionHistory!: PayLoadTransactionHistory;
  @Input() filterTransactionHistory!: Filter;
  @Output() onPageChange = new EventEmitter<number>();
  @Output() filter = new EventEmitter<Filter>();

  user: User | undefined;
  payload!: PayLoadTransactionHistory;
  originalPayload!: PayLoadTransactionHistory;
  feedbackObject: FeedbackObject | undefined;
  searchText: string = '';
  previousSearchText: string = '';

  // BEHAVIOR VARIABLES
  currentPage: number = 1;
  itemsPerPage: number = 5;
  loading: boolean | undefined;
  value!: number;
  visible: boolean = false;
  loadingFeedback: boolean = false;

  filterOptions: any[] = [
    {
      label: 'Tất cả',
      command: () => {
        this.handleFilterChange('ALL');
      },
    },
    {
      label: 'Thanh toán thành công',
      command: () => {
        this.handleFilterChange('PAID');
      },
    },
    {
      label: 'Đang chờ xử lý',
      command: () => {
        this.handleFilterChange('PENDING');
      },
    },
    {
      label: 'Thanh toán thất bại',
      command: () => {
        this.handleFilterChange('CANCELED');
      },
    },
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private ngZone: NgZone,
    private userStateService: UserStateService,
    private dialogBroadcastService: DialogBroadcastService,
    private feedbackService: FeedbackService
  ) {}

  get totalPages(): number {
    return this.payloadTransactionHistory.totalPages;
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && 'customElements' in window) {
      defineElement(lottie.loadAnimation);
      this.initData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['payloadTransactionHistory'] &&
      !changes['payloadTransactionHistory'].firstChange
    ) {
      this.ngZone.run(() => {
        this.payload = changes['payloadTransactionHistory'].currentValue;
        this.currentPage = this.payload.page || 1;
        this.loading = false; // Set loading to false once data is loaded
      });
    }
  }

  // INITIALIZATION ZONE
  initData(): void {
    this.loading = true; // Set loading to true before data is loaded
    const userSub$ = this.userStateService.getUserState().subscribe((user) => {
      if (user) {
        this.ngZone.run(() => {
          this.user = user;
        });
      } else {
        const userLocal = localStorage.getItem('UserInfo');
        if (userLocal) {
          this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
          this.userStateService.updateUserState(this.user);
        }
      }
    });
    this.subscriptions.push(userSub$);
    this.payload = this.payloadTransactionHistory;
    this.originalPayload = cloneDeep(this.payloadTransactionHistory);
    this.loading = false;
  }

  handleFeedbackTransaction(feedback: FeedbackObject) {
    if (this.loadingFeedback) {
      return;
    }

    this.loadingFeedback = true;
    const feedbackSub$ = this.feedbackService.postFeedback(feedback.content, feedback.rating, feedback.course_enroll_id).subscribe({
      next: (res) => {
        if (res.status === 201) {
          this.payload.data.forEach((transaction) => {
            if (transaction.id === feedback.transaction_id) {
              transaction.transactionLineItem[0].isFeedback = true;
            }
          });
          this.feedbackObject = undefined;
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Thông báo',
            message: 'Feedback thành công',
            type: 'success',
            return: false,
            numberBtn: 1,
          });
          this.loadingFeedback = false;
        }
      },
      error: (res) => {
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Thông báo',
          message: 'Feedback không thành công, mời bạn thử lại sau',
          type: 'error',
          return: false,
          numberBtn: 1,
        });
        this.feedbackObject = undefined;
        this.loadingFeedback = false;
      },
    });
    this.subscriptions.push(feedbackSub$);
    this.feedbackOverplay.hide();
  }

  // BEHAVIOR ZONE
  handleFilterChange(status: string): void {
    let newFilter = { ...this.filterTransactionHistory };
    switch (status) {
      case 'PAID':
        newFilter.filter = 'PAID';
        newFilter.code = undefined;
        break;
      case 'PENDING':
        newFilter.filter = 'PENDING';
        newFilter.code = undefined;
        break;
      case 'CANCELED':
        newFilter.filter = 'CANCELED';
        newFilter.code = undefined;
        break;
      case 'ALL':
        newFilter.filter = undefined;
        newFilter.code = undefined;
        break;
      case 'SEARCH':
        if (this.searchText.trim() === this.previousSearchText) {
          return;
        }

        if ( this.searchText.trim() !== '') {
          newFilter.code = this.searchText.trim();
        } else {
          if (this.originalPayload) {
            this.ngZone.run(() => {
              this.payload = cloneDeep(this.originalPayload);
              newFilter.code = undefined;
            });
            return;
          }
        }
        break;
      default:
        newFilter.filter = undefined;
        break;
    }

    this.previousSearchText = this.searchText.trim();
    this.loading = true;
    this.filter.emit(newFilter);
  }

  currentTransactions() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.payload.data.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onPageChange.emit(this.currentPage); // Emit the new page number
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onPageChange.emit(this.currentPage); // Emit the new page number
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.onPageChange.emit(this.currentPage); // Emit the new page number
  }

  paginate(event: any) {
    this.table.onLazyLoad.emit(event);
    this.currentPage = event.page + 1; // PrimeNG is 0-based, Angular is 1-based
    this.loading = true; // Set loading to true before data is reloaded
    this.onPageChange.emit(this.currentPage); // Emit the new page number
  }

  convertDateTimeToText(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('vi-VN');
  }

  showFeedbackOverPlay(event: Event, transaction: TransactionHistory) {
    this.feedbackObject = {
      transaction_id: transaction.id,
      content: '',
      rating: 0,
      course_enroll_id: transaction.transactionLineItem[0].course_mentor.course_enroll[0].id,
      isFeedback: transaction.transactionLineItem[0].isFeedback,
      is_mentor: transaction.transactionLineItem[0].course_mentor.is_mentor,
      start_date: transaction.transactionLineItem[0].course_mentor.start_date,
      end_date: transaction.transactionLineItem[0].course_mentor.end_date
    };
    this.feedbackOverplay.show(event);
  }

  clearFeedbackForm() {
    this.feedbackObject = undefined;
  }

  toggleSupportDialog() {
    this.openLink('https://m.me/288592671009847')
  }

  openLink(link: string): void {
    window.open(`${link}`, '_blank');
  }

  checkDateOfCourseOffline(end_date: Date): boolean {
    const currentDate = new Date();
  
    // Compare the end_date with the current date
    if (end_date <= currentDate) {
      return true;
    } else {
      return false;
    }
  }
  
}
