import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { EnrollCourseMentorDetail } from '../../core/models/enroll-course-mentor-detail.model';

@Component({
  selector: 'app-course-mentor-detail-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-detail-header.component.html',
  styleUrl: './course-mentor-detail-header.component.scss'
})
export class CourseMentorDetailHeaderComponent {
  @Input() enrollCourseDetail: EnrollCourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;
}
