import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCourseFooterComponent } from './learning-course-footer.component';

describe('LearningCourseFooterComponent', () => {
  let component: LearningCourseFooterComponent;
  let fixture: ComponentFixture<LearningCourseFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCourseFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCourseFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
