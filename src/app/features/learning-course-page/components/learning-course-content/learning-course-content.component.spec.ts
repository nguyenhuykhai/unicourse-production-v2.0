import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCourseContentComponent } from './learning-course-content.component';

describe('LearningCourseContentComponent', () => {
  let component: LearningCourseContentComponent;
  let fixture: ComponentFixture<LearningCourseContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCourseContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCourseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
