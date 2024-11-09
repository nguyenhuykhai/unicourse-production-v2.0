import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCourseItemComponent } from './loading-course-item.component';

describe('LoadingCourseItemComponent', () => {
  let component: LoadingCourseItemComponent;
  let fixture: ComponentFixture<LoadingCourseItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingCourseItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingCourseItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
