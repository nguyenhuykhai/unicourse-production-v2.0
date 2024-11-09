import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCourseHeaderComponent } from './learning-course-header.component';

describe('LearningCourseHeaderComponent', () => {
  let component: LearningCourseHeaderComponent;
  let fixture: ComponentFixture<LearningCourseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCourseHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCourseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
