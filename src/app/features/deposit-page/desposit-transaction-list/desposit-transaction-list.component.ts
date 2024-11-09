import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
  NgZone,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { Table } from 'primeng/table';
import { Filter, PayloadData, User } from '../../../common/models';
import { DialogBroadcastService, UserStateService } from '../../../common/services';
import { Subscription } from 'rxjs';
import { Deposit } from '../core/models';

@Component({
  selector: 'app-desposit-transaction-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './desposit-transaction-list.component.html',
  styleUrls: ['./desposit-transaction-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DespositTransactionListComponent implements OnInit, OnChanges {
  @ViewChild('dt2') table!: Table;
  @Input() payloadDeposit!: PayloadData<Deposit>;
  @Input() filterDeposit!: Filter;
  @Output() onPageChange = new EventEmitter<number>();
  @Output() filter = new EventEmitter<Filter>();

  user: User | undefined;
  payload!: PayloadData<Deposit>;

  // BEHAVIOR VARIABLES
  currentPage: number = 1;
  itemsPerPage: number = 5;
  loading: boolean | undefined;
  value!: number;

  filterOptions: any[] = [
    {
      label: 'Tất cả',
      command: () => {
        this.handleFilterChange('ALL');
      }
    },
    {
      label: 'Thanh toán thành công',
      command: () => {
        this.handleFilterChange('PAID');
      }
    },
    {
      label: 'Đang chờ xử lý',
      command: () => {
        this.handleFilterChange('PENDING');
      }
    },
    {
      label: 'Thanh toán thất bại',
      command: () => {
        this.handleFilterChange('CANCELED');
      }
    }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private ngZone: NgZone,
    private userStateService: UserStateService,
    private dialogBroadcastService: DialogBroadcastService
  ) {}

  get totalPages(): number {
    return this.payload.totalPages;
  }

  ngOnInit() {
    if (typeof window !== 'undefined' && 'customElements' in window) {
      defineElement(lottie.loadAnimation);
      this.initData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payloadDeposit'] && !changes['payloadDeposit'].firstChange) {
      this.ngZone.run(() => {
        this.payload = changes['payloadDeposit'].currentValue;
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
    this.payload = this.payloadDeposit;
    this.loading = false;
  }

  // BEHAVIOR ZONE
  handleFilterChange(status: string): void {
    let newFilter = { ...this.filterDeposit };
    switch (status) {
      case 'PAID':
        newFilter.where = { status: 'PAID' };
        break;
      case 'PENDING':
        newFilter.where = { status: 'PENDING' };
        break;
      case 'CANCELED':
        newFilter.where = { status: 'CANCELED' };
        break;
      case 'ALL':
        newFilter.where = {};
        break;
      default:
        newFilter.where = {};
        break;
    }
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

  toggleSupportDialog() {
    this.openLink('https://m.me/288592671009847')
  }

  openLink(link: string): void {
    window.open(`${link}`, '_blank');
  }
}
