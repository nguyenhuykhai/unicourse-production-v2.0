import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningProgressPageComponent } from './learning-progress-page.component';

describe('LearningProgressPageComponent', () => {
  let component: LearningProgressPageComponent;
  let fixture: ComponentFixture<LearningProgressPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningProgressPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
