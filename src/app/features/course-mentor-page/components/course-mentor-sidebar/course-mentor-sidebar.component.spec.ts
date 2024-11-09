import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorSidebarComponent } from './course-mentor-sidebar.component';

describe('CourseMentorSidebarComponent', () => {
  let component: CourseMentorSidebarComponent;
  let fixture: ComponentFixture<CourseMentorSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
