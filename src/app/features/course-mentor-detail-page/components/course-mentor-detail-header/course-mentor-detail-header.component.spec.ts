import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorDetailHeaderComponent } from './course-mentor-detail-header.component';

describe('CourseMentorDetailHeaderComponent', () => {
  let component: CourseMentorDetailHeaderComponent;
  let fixture: ComponentFixture<CourseMentorDetailHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorDetailHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorDetailHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
