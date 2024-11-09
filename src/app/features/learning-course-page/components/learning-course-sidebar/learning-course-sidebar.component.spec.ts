import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCourseSidebarComponent } from './learning-course-sidebar.component';

describe('LearningCourseSidebarComponent', () => {
  let component: LearningCourseSidebarComponent;
  let fixture: ComponentFixture<LearningCourseSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningCourseSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningCourseSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
