import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Course, Lecturer } from '../../../../common/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-content',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-content.component.html',
  styleUrl: './course-content.component.scss',
})
export class CourseContentComponent {
  @Input() course: Course | undefined;
  @Input() lecturer!: Lecturer | undefined;
  @Input() blockedUI: boolean | undefined;

  constructor(
    private readonly router: Router
  ) {}

  goToLecturerProfile() {
    // Navigate to lecturer profile
    this.router.navigate([`/lecturer/${this.lecturer?.id}`]);
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
}
