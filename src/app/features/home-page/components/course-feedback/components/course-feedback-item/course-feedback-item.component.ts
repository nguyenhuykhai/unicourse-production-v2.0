import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';
import { Feedback } from '../../../../../../common/models';

@Component({
  selector: 'app-course-feedback-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-feedback-item.component.html',
  styleUrl: './course-feedback-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseFeedbackItemComponent {
  @Input() public courseFeedback: Feedback | undefined;

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }
}
