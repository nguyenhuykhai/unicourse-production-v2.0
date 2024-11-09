import { Component, Input, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { EnrollCourseMentorDetail } from '../../core/models/enroll-course-mentor-detail.model';
import { AttendanceStatus, ParticipantStatus } from './core/model';
import { Participant, Session } from '../../../../common/models';

@Component({
  selector: 'app-course-mentor-detail-info',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-detail-info.component.html',
  styleUrl: './course-mentor-detail-info.component.scss'
})
export class CourseMentorDetailInfoComponent implements OnChanges {
  @Input() enrollCourseDetail: EnrollCourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;

  constructor(
    private ngZone: NgZone,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['enrollCourseDetail'] && changes['enrollCourseDetail'].currentValue) {
          this.initData(changes['enrollCourseDetail'].currentValue);
      }
  }

  // INITIALIZATION ZONE
  initData(data: EnrollCourseMentorDetail) {
    this.ngZone.run(() => {
      if (!data || !data.course_mentor.mentor_session || !data.participant) {
        return;
      }

      data.course_mentor.mentor_session.map((session: Session) => {
        session.attendance = this.convertAttendanceStatus(session, data!.participant);
      });
    });
  }

  // BEHAVIOR ZONE
  convertAttendanceStatus(session: Session, participant: Array<Participant>): string {
    if (session && participant && participant.length > 0) {
      const eventDay = participant.find((p: Participant) => p.mentor_session_id === session.id);
      if (eventDay && eventDay.attendance && eventDay.status === ParticipantStatus.PUBLISHED) {
        return AttendanceStatus.PRESENT;
      } else if (eventDay && !eventDay.attendance && eventDay.status === ParticipantStatus.PUBLISHED) {
        return AttendanceStatus.ABSENT;
      } else if (eventDay && !eventDay.attendance && eventDay.status === ParticipantStatus.DRAFT) {
        return AttendanceStatus.NOT_STARTED;
      }
    }

    return AttendanceStatus.NOT_STARTED;
  }

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
}
