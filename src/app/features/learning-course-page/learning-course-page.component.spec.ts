import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCoursePageComponent } from './learning-course-page.component';

describe('LearningCoursePageComponent', () => {
  let component: LearningCoursePageComponent;
  let fixture: ComponentFixture<LearningCoursePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCoursePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCoursePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
