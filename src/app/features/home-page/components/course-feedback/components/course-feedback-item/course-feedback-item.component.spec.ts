import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseFeedbackItemComponent } from './course-feedback-item.component';

describe('CourseFeedbackItemComponent', () => {
  let component: CourseFeedbackItemComponent;
  let fixture: ComponentFixture<CourseFeedbackItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseFeedbackItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseFeedbackItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
