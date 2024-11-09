import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-introduction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-introduction.component.html',
  styleUrl: './user-introduction.component.scss'
})
export class UserIntroductionComponent {
  @Input() createdAt!: string;

  convertDateToString(date: string): string {
    const currentDate = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return 'hôm nay';
    } else if (diffDays === 1) {
      return 'hôm qua';
    } else {
      return `${diffDays} ngày trước`;
    }
  }
}
