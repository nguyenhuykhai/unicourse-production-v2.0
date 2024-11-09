import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorDetailInfoComponent } from './course-mentor-detail-info.component';

describe('CourseMentorDetailInfoComponent', () => {
  let component: CourseMentorDetailInfoComponent;
  let fixture: ComponentFixture<CourseMentorDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorDetailInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
