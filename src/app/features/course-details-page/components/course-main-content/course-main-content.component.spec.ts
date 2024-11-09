import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseMainContentComponent } from './course-main-content.component';

describe('CourseMainContentComponent', () => {
  let component: CourseMainContentComponent;
  let fixture: ComponentFixture<CourseMainContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseMainContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseMainContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
