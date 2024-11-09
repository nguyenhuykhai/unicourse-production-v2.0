import {
  ApplicationRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { first } from 'rxjs';
import { Lecturer } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-instructor',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-instructor.component.html',
  styleUrl: './course-instructor.component.scss',
})
export class CourseInstructorComponent {
  @Input() lecturer: Lecturer | undefined;
  @Input() blockedUI: boolean | undefined;
  constructor(
    private applicationRef: ApplicationRef,
    private readonly router: Router
  ) {}

  goToLecturerProfile() {
    // Navigate to lecturer profile
    this.router.navigate([`/lecturer/${this.lecturer?.id}`]);
  }
}
