import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DespositTransactionListComponent } from './desposit-transaction-list/desposit-transaction-list.component';
import { PaymentService } from '../../common/services';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { Filter, PayloadData } from '../../common/models';
import { Deposit } from './core/models';
import { DepositService } from './core/services';

@Component({
  selector: 'app-deposit-page',
  standalone: true,
  imports: [SharedModule, DespositTransactionListComponent],
  templateUrl: './deposit-page.component.html',
  styleUrls: ['./deposit-page.component.scss'],
})
export class DepositPageComponent implements OnInit, OnDestroy {
  payloadDeposit: PayloadData<Deposit> | undefined;
  public blockedUI: boolean = true;
  public filter: Filter = {
    page: 1,
    pageSize: 5,
    where: {},
    orderBy: {
      created_at: 'desc',
    },
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private depositService: DepositService,
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
      this.depositService.getDeposit(this.filter).pipe(
        catchError((error) => {
          return of(null);
        })
      )
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200) {
          this.payloadDeposit = result[0].data;
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