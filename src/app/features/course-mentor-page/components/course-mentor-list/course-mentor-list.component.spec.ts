import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMentorListComponent } from './course-mentor-list.component';

describe('CourseMentorListComponent', () => {
  let component: CourseMentorListComponent;
  let fixture: ComponentFixture<CourseMentorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMentorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMentorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
