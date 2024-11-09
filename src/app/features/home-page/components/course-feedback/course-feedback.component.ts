import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CourseFeedbackItemComponent } from './components/course-feedback-item/course-feedback-item.component';
import { Feedback } from '../../../../common/models';

@Component({
  selector: 'app-course-feedback',
  standalone: true,
  imports: [SharedModule, CourseFeedbackItemComponent],
  templateUrl: './course-feedback.component.html',
  styleUrl: './course-feedback.component.scss',
})
export class CourseFeedbackComponent {
  @Input() public courseFeedbacks: Feedback[] = [];

  ngOnInit() {
    // Get maximum 6 feedbacks
    this.courseFeedbacks = this.courseFeedbacks.slice(0, 6);
  }
}
