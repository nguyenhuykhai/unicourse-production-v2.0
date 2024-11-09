import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerProfilePageComponent } from './lecturer-profile-page.component';

describe('LecturerProfilePageComponent', () => {
  let component: LecturerProfilePageComponent;
  let fixture: ComponentFixture<LecturerProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerProfilePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
