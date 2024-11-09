import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { Filter } from '../../common/models';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { TransactionHistoryService } from './core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { PayLoadTransactionHistory, TransactionHistory } from './core/models';

@Component({
  selector: 'app-transaction-history-page',
  standalone: true,
  imports: [SharedModule, TransactionListComponent],
  templateUrl: './transaction-history-page.component.html',
  styleUrl: './transaction-history-page.component.scss'
})
export class TransactionHistoryPageComponent implements OnInit, OnDestroy {
  payloadTransactionHistory: PayLoadTransactionHistory | undefined;
  public blockedUI: boolean = true;
  public filter: Filter = {
    page: 1,
    pageSize: 5,
    orderBy: {
      created_at: 'desc',
    },
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private transactionHistoryService: TransactionHistoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initData(): void {
    this.blockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.transactionHistoryService.getTransactionHistory(this.filter).pipe(
        catchError((error) => {
          return of(null);
        })
      )
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200) {
          this.payloadTransactionHistory = result[0].data;
          this.blockedUI = false;
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  onPageChange(page: number): void {
    this.filter.page = page;
    this.initData();
  }

  onChangeFilter(filter: Filter): void {
    this.filter = filter;
    this.initData();
  }
}
