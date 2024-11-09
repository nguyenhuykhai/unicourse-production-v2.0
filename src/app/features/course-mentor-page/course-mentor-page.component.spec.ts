import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorPageComponent } from './course-mentor-page.component';

describe('CourseMentorPageComponent', () => {
  let component: CourseMentorPageComponent;
  let fixture: ComponentFixture<CourseMentorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
