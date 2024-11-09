import { ApplicationRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { DialogBroadcastService } from '../../common/services';
import { UserService } from '../../common/services/user.service';
import { EnrollCourse, Student } from '../../common/models';
import { SharedModule } from '../../shared/shared.module';
import { CourseCardComponent } from './components/course-card/course-card.component';

@Component({
  selector: 'app-learning-progress-page',
  standalone: true,
  imports: [SharedModule, CourseCardComponent],
  templateUrl: './learning-progress-page.component.html',
  styleUrl: './learning-progress-page.component.scss',
})
export class LearningProgressPageComponent implements OnInit, OnDestroy {
  user: Student | undefined;
  enrolledCourses: EnrollCourse[] = [];
  public blockedUI: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.initData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initData() {
    const forkJoinSubscription$ = forkJoin([
      this.userService.getStudentProfile().pipe(
        catchError(error => {
          return of(null);
        })
      ),
      this.userService.getEnrolledCourses().pipe(
        catchError(error => {
          return of(null);
        })
      ),
    ]).subscribe(result => {
      if (result[0]?.status === 200 && result[1]?.status === 200) {
        this.user = result[0].data;
        this.enrolledCourses = result[1].data;
        this.blockedUI = false;
      }
    })

    this.subscriptions.push(forkJoinSubscription$);
  }

  // BEHAVIOR ZONE
  scrollToTarget() {
    const targetElement = document.getElementById('targetDiv');

    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200; // Adjust this value as necessary

      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
