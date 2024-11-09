import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class CalendarHeaderComponent implements OnChanges {
  @Input() currentMonth!: string;
  @Input() currentYear!: number;
  currentVNMonth!: string;

  // Emit events to parent to signal month change
  @Output() monthChanged = new EventEmitter<{ monthIndex: number, year: number }>();

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['currentMonth']) {
          this.currentVNMonth = this.convertMonthToVietnamese(this.currentMonth)
      }
  }

  // Handle previous month click
  previousMonth(): void {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let monthIndex = monthNames.indexOf(this.currentMonth);
    let year = this.currentYear;

    // Decrease month, adjust year if necessary
    if (monthIndex === 0) {
      monthIndex = 11;
      year -= 1;
    } else {
      monthIndex -= 1;
    }

    // Emit updated month and year
    this.monthChanged.emit({ monthIndex, year });
  }

  // Handle next month click
  nextMonth(): void {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let monthIndex = monthNames.indexOf(this.currentMonth);
    let year = this.currentYear;

    // Increase month, adjust year if necessary
    if (monthIndex === 11) {
      monthIndex = 0;
      year += 1;
    } else {
      monthIndex += 1;
    }

    // Emit updated month and year
    this.monthChanged.emit({ monthIndex, year });
  }

  convertMonthToVietnamese(month: string): string {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthVietNamNames = ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];
    return monthVietNamNames[monthNames.indexOf(month)];
  }
}