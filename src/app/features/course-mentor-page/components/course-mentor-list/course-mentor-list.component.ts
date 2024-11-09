import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CourseMentorDetail } from '../../../../common/models';

@Component({
  selector: 'app-course-mentor-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-list.component.html',
  styleUrl: './course-mentor-list.component.scss'
})
export class CourseMentorListComponent {
  @Input() courseMentor: CourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;

  // BEHAVIOR VARIABLES
  public visible: boolean = false;

  // BEHAVIOR ZONE
  // "start_time": "2024-10-29T07:10:32.000Z",
  // "end_time": "2024-10-29T09:58:32.000Z",
  //--> 2 giờ 48 phút
  convertDuration(start_time: Date, end_time: Date) {
    const start = new Date(start_time);
    const end = new Date(end_time);
    const diff = Math.abs(end.getTime() - start.getTime());
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
  }

  showDialog() {
    this.visible = true;
  }
}
