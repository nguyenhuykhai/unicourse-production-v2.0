import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorDetailCenterInfoComponent } from './course-mentor-detail-center-info.component';

describe('CourseMentorDetailCenterInfoComponent', () => {
  let component: CourseMentorDetailCenterInfoComponent;
  let fixture: ComponentFixture<CourseMentorDetailCenterInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorDetailCenterInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorDetailCenterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
