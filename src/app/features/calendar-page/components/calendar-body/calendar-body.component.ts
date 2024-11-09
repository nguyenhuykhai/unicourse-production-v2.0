import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CalendarDayComponent } from './components/calendar-day/calendar-day.component';
import { Calendar, Day, Week } from '../../core/models';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AttendanceStatus, ParticipantStatus } from './core/model';

@Component({
  selector: 'app-calendar-body',
  standalone: true,
  imports: [SharedModule, CalendarDayComponent],
  templateUrl: './calendar-body.component.html',
  styleUrl: './calendar-body.component.scss',
})
export class CalendarBodyComponent {
  @ViewChild('op') eventOverplay!: OverlayPanel;
  @Input() currentMonth!: string;
  @Input() currentYear!: number;
  @Input() daysOfWeek!: { full: string; short: string }[];
  @Input() weeks!: Array<Array<Day>>;
  @Input() blockedUI!: boolean;
  dayDisplayOverplay: Day | undefined;

  // BEHAVIOR ZONE
  toggleEventOverPlay(event: Event, day: Day) {
    if (this.eventOverplay) {
      this.dayDisplayOverplay = day;
      this.dayDisplayOverplay ? this.convertAttendanceStatus(this.dayDisplayOverplay) : null;
      this.eventOverplay.toggle(event);
    }
  }

  convertAttendanceStatus(dayDisplayOverplay: Day): void {
    if (dayDisplayOverplay.events.length > 0) {
      dayDisplayOverplay.events.map((event) => {
        if (event.participant && event.participant.attendance && event.participant.status === ParticipantStatus.PUBLISHED) {
          event.participant.status = AttendanceStatus.PRESENT;
        } else if (event.participant && !event.participant.attendance && event.participant.status === ParticipantStatus.PUBLISHED) {
          event.participant.status = AttendanceStatus.ABSENT;
        } else if (event.participant && !event.participant.attendance && event.participant.status === ParticipantStatus.DRAFT) {
          event.participant.status = AttendanceStatus.NOT_STARTED;
        }
      });
    }
  }

  convertTimeToDisplay(time: Date | undefined): string {
    if (!time) {
      return '';
    }

    return time.toString().split('T')[1].slice(0, 5);
  }
}
