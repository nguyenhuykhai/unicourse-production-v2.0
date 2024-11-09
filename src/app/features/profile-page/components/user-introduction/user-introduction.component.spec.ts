import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIntroductionComponent } from './user-introduction.component';

describe('UserIntroductionComponent', () => {
  let component: UserIntroductionComponent;
  let fixture: ComponentFixture<UserIntroductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserIntroductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
