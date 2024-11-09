import { Component, Input } from '@angular/core';
import { EnrollCourse } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
})
export class CourseCardComponent {
  @Input() course!: EnrollCourse;
  progress: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.calculateProgress();
  }

  calculateProgress() {
    this.progress = Math.floor(this.course._count.learning_progress / this.course.totalTopic * 100);
  }

  convertDateToText(date: string, learning_progress: number): string {
    if (learning_progress === 0) {
      return 'Bạn chưa bắt đầu học';
    }

    const currentDate = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return 'Hôm nay';
    } else if (diffDays < 2) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `Học cách đây ${diffDays} ngày`;
    } else if (diffDays < 30) {
      return `Học cách đây ${Math.floor(diffDays / 7)} tuần`;
    } else {
      return `Học cách đây ${Math.floor(diffDays / 30)} tháng`;
    }
  }
}
