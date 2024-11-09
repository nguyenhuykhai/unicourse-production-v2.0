import { Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { CalendarBodyComponent } from './components/calendar-body/calendar-body.component';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { CalendarService } from './core/services';
import { isPlatformBrowser } from '@angular/common';
import { Calendar, Day, DayOfWeek, Event, FilterCalendar, Week } from './core/models';
import { Participant, Session } from '../../common/models';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [SharedModule, CalendarHeaderComponent, CalendarBodyComponent],
  templateUrl: './calendar-page.component.html',
  styleUrls: ['./calendar-page.component.scss'],
})
export class CalendarPageComponent implements OnInit, OnDestroy {
  currentMonth!: string
  currentYear!: number;
  weeks: Array<Array<Day>> = [];

  daysOfWeek: Array<DayOfWeek> = [
    { full: 'Chủ nhật', short: 'Sun' },
    { full: 'Thứ hai', short: 'Mon' },
    { full: 'Thứ ba', short: 'Tue' },
    { full: 'Thứ tư', short: 'Wed' },
    { full: 'Thứ năm', short: 'Thu' },
    { full: 'Thứ sáu', short: 'Fri' },
    { full: 'Thứ bảy', short: 'Sat' }
  ];

  filterOptions: FilterCalendar = {} as FilterCalendar;
  public blockedUI: boolean = true;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly calendarService: CalendarService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initDefaultCalendar(); // Initialize with current real-time month
      const today = new Date();
      const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      this.loadEvents(today, previousMonth, nextMonth); // Load events for the current month
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  // Initialize calendar with current real-time month
  initDefaultCalendar(): void {
    const today = new Date();
    this.currentMonth = today.toLocaleString('default', { month: 'long' });
    this.currentYear = today.getFullYear();
    this.initCalendarForMonth(today.getMonth(), this.currentYear);
  }

  // Logic to initialize the calendar for a given month and year
  initCalendarForMonth(monthIndex: number, year: number): void {
    this.blockedUI = true;

    // Get number of days in the current month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

    // Get number of days in the previous month
    const daysInPreviousMonth = new Date(year, monthIndex, 0).getDate();

    // Initialize weeks array
    this.weeks = [];
    let dayCounter = 1;

    // Generate the calendar weeks
    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
      const week: Array<Day> = [];

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        if (weekIndex === 0 && dayIndex < firstDayOfMonth) {
          // Days before the start of the current month (previous month days)
          const prevMonthDay = daysInPreviousMonth - (firstDayOfMonth - dayIndex - 1);
          week.push({ dayNumber: prevMonthDay, events: [], fromCurrentMonth: false });
        } else if (dayCounter > daysInMonth) {
          // Days after the end of the current month (next month days)
          const nextMonthDay = dayCounter - daysInMonth;
          week.push({ dayNumber: nextMonthDay, events: [], fromCurrentMonth: false });
          dayCounter++;
        } else {
          // Days within the current month
          week.push({ dayNumber: dayCounter, events: [], fromCurrentMonth: true });
          dayCounter++;
        }
      }
      this.weeks.push(week);
      if (dayCounter > daysInMonth && weekIndex >= 4) break;
    }
  }

  // Load events for the date range from the 15th of the previous month to the 15th of the next month
  loadEvents(today: Date, previousMonth: Date, nextMonth: Date): void {
    // Set the middle month as the current month for display
    this.currentMonth = today.toLocaleString('default', { month: 'long' });

    // Update filterOptions for the API call
    this.filterOptions.startDate = previousMonth.toISOString().split('T')[0];
    this.filterOptions.endDate = nextMonth.toISOString().split('T')[0];

    const forkJoinSubscription$ = forkJoin([
      this.calendarService.getListOfflineEnrolledCourses(this.filterOptions).pipe(
        catchError((error) => {
          console.error('Error fetching events:', error);
          return of(null);
        })
      )
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0] && result[0].status === 200) {
          this.mapResponseToCalendar(result[0].data);
          this.blockedUI = false;
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  // BEHAVIOR ZONE
  // Map API response to the calendar
  mapResponseToCalendar(data: Array<Calendar>): void {
    data.forEach((course: Calendar) => {
      if (course && course.course_mentor && course.course_mentor.mentor_session) {
        course.course_mentor.mentor_session.map((session: Session) => {
          const sessionDate = new Date(session.start_time);
          const dayNumber = sessionDate.getDate();
          const weekIndex = Math.floor((dayNumber + new Date(this.currentYear, sessionDate.getMonth(), 1).getDay() - 1) / 7);
          const dayIndex = sessionDate.getDay();
  
          // Add the event to the corresponding day in the weeks array
          const weekDay: Day = this.weeks[weekIndex][dayIndex];
          if (weekDay && weekDay.dayNumber === dayNumber && weekDay.fromCurrentMonth) {
            this.weeks[weekIndex][dayIndex].id = course.id;
            this.weeks[weekIndex][dayIndex].title = course.course_mentor.title;
            this.weeks[weekIndex][dayIndex].status = course.course_mentor.status;
            this.weeks[weekIndex][dayIndex].course_id = course.course_mentor.course_id;
            this.weeks[weekIndex][dayIndex].mentor_id = course.course_mentor.mentor_id;
            this.weeks[weekIndex][dayIndex].center_id = course.course_mentor.center ? course.course_mentor.center.id : null;
            this.weeks[weekIndex][dayIndex].start_date = session.start_time;
            this.weeks[weekIndex][dayIndex].end_date = session.end_time;
            this.weeks[weekIndex][dayIndex].events.push({
              name: session.title,
              time: `${sessionDate.getHours()}:${('0' + sessionDate.getMinutes()).slice(-2)}`,
              mentor_session: session,
              participant: this.findParticipant(course.participant, session),
              center: course.course_mentor.center,
              mentor: course.course_mentor.mentor
            });
          }
        });
      }
    });
  }

  findParticipant(participants: Array<Participant>, session: Session): Participant | undefined {
    return participants.find((participant) => participant.mentor_session_id === session.id);
  }

  // Logic to handle month change emitted from the child component
  onMonthChange({ monthIndex, year }: { monthIndex: number, year: number }): void {
    this.currentMonth = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });
    this.currentYear = year;
    this.initCalendarForMonth(monthIndex, year);
    this.loadEvents(new Date(year, monthIndex), new Date(year, monthIndex - 1, 15), new Date(year, monthIndex + 1, 15));
  }
}