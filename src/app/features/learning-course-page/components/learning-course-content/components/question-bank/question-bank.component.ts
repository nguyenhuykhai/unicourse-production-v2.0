import { Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Answer, QuestionBank } from '../../core/models';
import { Topic } from '../../../../../../common/models';
import { cloneDeep } from 'lodash';
import { ProgressCircleComponent } from '../../../../../../common/components/progress-circle/progress-circle.component';

@Component({
  selector: 'app-question-bank',
  standalone: true,
  imports: [SharedModule, ProgressCircleComponent],
  templateUrl: './question-bank.component.html',
  styleUrls: ['./question-bank.component.scss'], // Updated styleUrls (note plural)
})
export class QuestionBankComponent implements OnChanges, OnDestroy {
  @Output() questionStateChange = new EventEmitter<string>();
  @Input() questionBank: Array<QuestionBank> | undefined;
  @Input() currentTopic: Topic | undefined;
  clonedQuestionBank: Array<QuestionBank> | undefined;

  currentQuestion = 1; // Keep track of the current question number
  completedQuestions = 0; // Count how many questions are answered
  totalQuestions = 0; // Total number of questions
  totalRightAnswers = 0; // Total number of right answers
  timerInterval: any;
  timeRemainingInSeconds: number = 0;
  timeDisplay: string = '00 : 00';
  questionState: string = 'NOT_STARTED'; // NOT_STARTED, IN_PROGRESS, COMPLETED

  constructor(
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questionBank'] && changes['questionBank'].currentValue) {
      this.clonedQuestionBank = cloneDeep(this.questionBank);
      this.totalQuestions = this.clonedQuestionBank?.length || 0;
      this.updateCompletedQuestions(); // Ensure to update completed questions on load
    }
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
  //LOGIC ZONE
  startQuiz(): void {
    this.questionState = 'IN_PROGRESS';
    this.questionStateChange.emit(this.questionState);
    // Start the countdown when questionBank changes
    const durationInMinutes = this.currentTopic?.element_topic?.question_bank?.duration || 30;
    this.startCountdown(durationInMinutes);
  }

  finishQuiz(): void {
    if (this.questionState === 'IN_PROGRESS' && this.timeRemainingInSeconds > 0 && this.completedQuestions < 100) {
      return;
    }

    this.checkAnswers();
    this.currentQuestion = 1;
    this.questionState = 'COMPLETED';
    this.questionStateChange.emit(this.questionState);
    
    // Clear the interval when the quiz is finished
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startQuizAgain(): void {
    this.ngZone.run(() => {
      this.clonedQuestionBank = cloneDeep(this.questionBank);
      this.questionState = 'IN_PROGRESS';
      this.questionStateChange.emit(this.questionState);
      this.currentQuestion = 1;
      this.completedQuestions = 0;
      this.totalQuestions = this.clonedQuestionBank?.length || 0;
      this.timeRemainingInSeconds = 0;
      this.timeDisplay = '00 : 00';
      this.scrollToTarget(`${this.clonedQuestionBank?.[0].id}`);
    });
    // Reset the timer and start again
    const durationInMinutes = this.currentTopic?.element_topic?.question_bank?.duration || 30;
    this.startCountdown(durationInMinutes);
  }

  checkAnswers(): void {
    if (this.clonedQuestionBank) {
      this.clonedQuestionBank.map((question: QuestionBank) => {
        switch (question.type) {
          case 'SINGLE':
            question.userAnswerCorrect = this.checkSingleChoiceAnswer(question);
            break;
          case 'MULTIPLE':
            question.userAnswerCorrect = this.checkMultipleChoiceAnswer(question);
            break;
          default:
            break;
        }
      });
      this.totalRightAnswers = this.clonedQuestionBank.filter((q) => q.userAnswerCorrect).length;
    }
  }

  checkSingleChoiceAnswer(question: QuestionBank): boolean {
    const correctAnswer = question.answer.find((a) => a.is_correct);
    if (correctAnswer) {
      const userAnswer = question.answer.find((a) => a.isChoiced);
      return userAnswer?.id === correctAnswer.id;
    }
    return false;
  }

  checkMultipleChoiceAnswer(question: QuestionBank): boolean {
    const correctAnswers = question.answer.filter((a) => a.is_correct);
    const userAnswers = question.answer.filter((a) => a.isChoiced);
    if (correctAnswers.length === userAnswers.length) {
      return correctAnswers.every((c) => userAnswers.some((u) => u.id === c.id));
    }
    return false;
  }

  // COUTNDOWN TIMER METHODS
  // Method to start the countdown timer
  startCountdown(durationInMinutes: number): void {
    this.timeRemainingInSeconds = durationInMinutes * 60;

    // Clear any previous interval to avoid multiple timers
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000); // Update every second
  }

  // Method to update the timer and stop when it reaches zero
  updateTimer(): void {
    if (this.timeRemainingInSeconds > 0) {
      this.timeRemainingInSeconds--;

      // Calculate minutes and seconds
      const minutes = Math.floor(this.timeRemainingInSeconds / 60);
      const seconds = this.timeRemainingInSeconds % 60;

      // Format display with leading zeros
      this.timeDisplay = `${this.padWithZero(minutes)} : ${this.padWithZero(seconds)}`;
    } else {
      this.handleTimerEnd();
    }
  }

  // Method to handle when the timer ends
  handleTimerEnd(): void {
    this.finishQuiz();
  }

  // Utility function to pad single-digit numbers with a leading zero
  padWithZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  // BEHAVIOR ZONE
  handleToggleAnswer(answer: Answer): void {
    if (this.questionState === 'COMPLETED' || this.questionState === 'NOT_STARTED') {
      return;
    }

    // Check type of question is SINGLE or MULTIPLE
    const question = this.clonedQuestionBank?.find((q) =>
      q.answer.some((a) => a.id === answer.id)
    );

    if (!question) {
      return;
    }

    switch (question.type) {
      case 'SINGLE':
        this.handleSingleChoice(answer);
        break;
      case 'MULTIPLE':
        this.handleMultipleChoice(answer);
        break;
      default:
        break;
    }
    
    this.updateCompletedQuestions();
  }

  // Method to update the count of answered questions
  updateCompletedQuestions(): void {
    if (this.clonedQuestionBank) {
      let totalAnswered = 0;
      this.clonedQuestionBank.map((question: QuestionBank) => {
        question.alreadyAnswered ? totalAnswered++ : null;
      });
      this.completedQuestions = totalAnswered / this.totalQuestions * 100;
    }
  }

  handleSingleChoice(answer: Answer): void {
    if (this.clonedQuestionBank) {
      this.clonedQuestionBank.map((question: QuestionBank) => {
        if (question.id === answer.question_id) {
          question.answer.map((a: Answer) => {
            a.id === answer.id ? a.isChoiced = !a.isChoiced : a.isChoiced = false;
            question.alreadyAnswered = question.answer.some((a) => a.isChoiced);
          });
        }
      });
    }
  }

  handleMultipleChoice(answer: Answer): void {
    if (this.clonedQuestionBank) {
      this.clonedQuestionBank.map((question: QuestionBank) => {
        if (question.id === answer.question_id) {
          question.answer.map((a: Answer) => {
            a.id === answer.id ? a.isChoiced = !a.isChoiced : null;
            question.alreadyAnswered = question.answer.some((a) => a.isChoiced);
          });
        }
      });
    }
  }

  // Check if a question has been answered
  isAnswered(index: number): boolean {
    if (this.clonedQuestionBank) {
      return this.clonedQuestionBank[index].answer.some((a) => a.isChoiced);
    }
    return false;
  }

  isCorrect(index: number): boolean {
    if (this.clonedQuestionBank) {
      return this.clonedQuestionBank[index].userAnswerCorrect || false;
    }
    return false;
  }

  // Navigate to the clicked question
  goToQuestion(questionNumber: number, question: QuestionBank): void {
    this.currentQuestion = questionNumber;
    // Add logic if needed for smooth navigation (if paginated or single question view)
    this.scrollToTarget(`${question.id}`);
  }

  // Close button logic (UI to close question bank)
  closeQuestionBank(): void {
    // Logic to close the question bank or navigate back
  }

  // Method to get the explanation for an answer
  getExplanation(answer: Answer): string {
    return answer.explaination;
  }

  // Method to check if the answer is correct
  isAnswerCorrect(answer: Answer): boolean {
    return answer.is_correct;
  }

  scrollToTarget(id: string) {
    const targetElement = document.getElementById(`question-${id}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }  
}
