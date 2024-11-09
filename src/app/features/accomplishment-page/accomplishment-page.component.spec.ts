import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccomplishmentPageComponent } from './accomplishment-page.component';

describe('AccomplishmentPageComponent', () => {
  let component: AccomplishmentPageComponent;
  let fixture: ComponentFixture<AccomplishmentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccomplishmentPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccomplishmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
