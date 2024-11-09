import { ApplicationRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReviewItemComponent } from './review-item/review-item.component';
import { SharedModule } from '../../../../shared/shared.module';
import { first } from 'rxjs';
import { Feedbacks } from '../../core/models';
import { Course } from '../../../../common/models';

@Component({
  selector: 'app-course-reviews',
  standalone: true,
  imports: [ReviewItemComponent, SharedModule],
  templateUrl: './course-reviews.component.html',
  styleUrl: './course-reviews.component.scss',
})
export class CourseReviewsComponent implements OnInit, OnDestroy {
  @Input() feedbacks!: Array<Feedbacks>;
  @Input() course: Course | undefined;
  @Input() blockedUI: boolean | undefined;
  totalFeedbacks: number = 0;

  constructor(private applicationRef: ApplicationRef) {}

  ngOnInit() {
    // Wait until the application is stable before initializing the data
    // this.applicationRef.isStable.pipe(first((isStable) => isStable)).subscribe(() => {});
  }

  ngOnDestroy() {}
}
