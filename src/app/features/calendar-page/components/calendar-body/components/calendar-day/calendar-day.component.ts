import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss'
})
export class CalendarDayComponent implements OnChanges {
  @Input() day!: { dayNumber: number, events: { name: string, time: string }[] };
  @Input() currentMonth!: string;
  @Input() currentYear!: number;

  
  // BEHAVIOR VARIABLES
  isActive!: boolean;
  today = new Date().getDate(); // Extract the current day number (1-31)
  thisMonth = new Date().getMonth(); // Extract the current month number (0-11)
  thisYear = new Date().getFullYear(); // Extract the current year number (4 digits)

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day']) {
      this.isActive = this.isToday();
    }
  }

  // Check if today is in the current month and year
  isToday(): boolean {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let monthIndex = monthNames.indexOf(this.currentMonth);
    return this.today === this.day.dayNumber && monthIndex === this.thisMonth && this.thisYear === this.currentYear;
  }
}
