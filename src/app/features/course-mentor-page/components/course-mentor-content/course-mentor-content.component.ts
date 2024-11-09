import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CourseMentorDetail } from '../../../../common/models';

@Component({
  selector: 'app-course-mentor-content',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-content.component.html',
  styleUrl: './course-mentor-content.component.scss'
})
export class CourseMentorContentComponent {
  @Input() courseMentor: CourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;

  // Convert dateTime to string: 2024-08-05T09:58:52.000Z -> Cập nhật gần nhất 05/08/2024
  convertDateToString(date: any): string {
    const currentDate = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return 'hôm nay';
    } else if (diffDays === 1) {
      return 'hôm qua';
    } else {
      return `${diffDays} ngày trước`;
    }
  }
  
  scrollToTarget() {
    const targetElement = document.getElementById('targetDivMain');

    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
