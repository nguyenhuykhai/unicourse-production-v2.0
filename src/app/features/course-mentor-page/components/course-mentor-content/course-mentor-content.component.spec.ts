import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorContentComponent } from './course-mentor-content.component';

describe('CourseMentorContentComponent', () => {
  let component: CourseMentorContentComponent;
  let fixture: ComponentFixture<CourseMentorContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
