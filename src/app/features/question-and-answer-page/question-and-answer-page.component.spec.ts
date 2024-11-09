import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAndAnswerPageComponent } from './question-and-answer-page.component';

describe('QuestionAndAnswerPageComponent', () => {
  let component: QuestionAndAnswerPageComponent;
  let fixture: ComponentFixture<QuestionAndAnswerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionAndAnswerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionAndAnswerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
