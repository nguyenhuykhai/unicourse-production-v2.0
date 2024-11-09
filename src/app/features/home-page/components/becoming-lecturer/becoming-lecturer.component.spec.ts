import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomingLecturerComponent } from './becoming-lecturer.component';

describe('BecomingLecturerComponent', () => {
  let component: BecomingLecturerComponent;
  let fixture: ComponentFixture<BecomingLecturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomingLecturerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecomingLecturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
