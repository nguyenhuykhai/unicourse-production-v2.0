import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Course } from '../../../../common/models';

@Component({
  selector: 'app-course-requirements',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-requirements.component.html',
  styleUrl: './course-requirements.component.scss'
})
export class CourseRequirementsComponent {
  @Input() course: Course | undefined;
  @Input() blockedUI: boolean | undefined;
}
