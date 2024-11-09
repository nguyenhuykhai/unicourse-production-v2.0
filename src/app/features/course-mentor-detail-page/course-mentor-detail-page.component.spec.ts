import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorDetailPageComponent } from './course-mentor-detail-page.component';

describe('CourseMentorDetailPageComponent', () => {
  let component: CourseMentorDetailPageComponent;
  let fixture: ComponentFixture<CourseMentorDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
