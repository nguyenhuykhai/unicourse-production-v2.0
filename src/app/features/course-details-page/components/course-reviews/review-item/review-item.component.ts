import { Component, Input } from '@angular/core';

import { SharedModule } from '../../../../../shared/shared.module';
import { Feedbacks } from '../../../core/models';

@Component({
  selector: 'app-review-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './review-item.component.html',
  styleUrl: './review-item.component.scss',
})
export class ReviewItemComponent {
  @Input() review!: Feedbacks;

  public ratingArray: any[] = [];

  constructor() {}

  ngOnInit(): void {}

  convertDateToString(feedback: Feedbacks): string {
    if (!feedback?.created_at) {
      return '';
    }
    const currentDate = new Date();
    const createdDate = new Date(feedback.created_at);
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

  createArray(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
  }
}
