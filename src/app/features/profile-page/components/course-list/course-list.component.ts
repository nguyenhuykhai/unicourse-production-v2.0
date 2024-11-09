import { Component, Input } from '@angular/core';
import { EnrollCourse } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent {
  @Input() enrolledCourses!: EnrollCourse[];
}
