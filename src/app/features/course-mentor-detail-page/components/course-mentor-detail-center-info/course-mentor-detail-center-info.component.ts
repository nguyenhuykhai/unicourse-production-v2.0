import { Component, Input } from '@angular/core';
import { EnrollCourseMentorDetail } from '../../core/models/enroll-course-mentor-detail.model';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-course-mentor-detail-center-info',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-detail-center-info.component.html',
  styleUrl: './course-mentor-detail-center-info.component.scss'
})
export class CourseMentorDetailCenterInfoComponent {
  @Input() enrollCourseDetail: EnrollCourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;
}
