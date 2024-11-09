import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorInfoComponent } from './course-mentor-info.component';

describe('CourseMentorInfoComponent', () => {
  let component: CourseMentorInfoComponent;
  let fixture: ComponentFixture<CourseMentorInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
