import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CourseMentorDetail } from '../../../../common/models';

@Component({
  selector: 'app-course-mentor-info',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-info.component.html',
  styleUrl: './course-mentor-info.component.scss'
})
export class CourseMentorInfoComponent {
  @Input() courseMentor: CourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;

  
}
