import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DespositTransactionListComponent } from './desposit-transaction-list.component';

describe('DespositTransactionListComponent', () => {
  let component: DespositTransactionListComponent;
  let fixture: ComponentFixture<DespositTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespositTransactionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DespositTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
