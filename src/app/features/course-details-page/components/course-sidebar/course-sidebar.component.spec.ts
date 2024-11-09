import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSidebarComponent } from './course-sidebar.component';

describe('CourseSidebarComponent', () => {
  let component: CourseSidebarComponent;
  let fixture: ComponentFixture<CourseSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
