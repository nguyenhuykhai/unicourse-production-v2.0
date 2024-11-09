import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CourseMentorDetailCenterInfoComponent } from './components/course-mentor-detail-center-info/course-mentor-detail-center-info.component';
import { CourseMentorDetailInfoComponent } from './components/course-mentor-detail-info/course-mentor-detail-info.component';
import { CourseMentorDetailHeaderComponent } from './components/course-mentor-detail-header/course-mentor-detail-header.component';
import { catchError, filter, forkJoin, of, Subscription, switchMap } from 'rxjs';
import { EnrollCourseMentorDetail } from './core/models/enroll-course-mentor-detail.model';
import { EnrollCourseMentorDetailService } from './core/services/enroll-course-mentor-detail.service';
import { DialogBroadcastService } from '../../common/services';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-course-mentor-detail-page',
  standalone: true,
  imports: [
    SharedModule,
    CourseMentorDetailCenterInfoComponent,
    CourseMentorDetailHeaderComponent,
    CourseMentorDetailInfoComponent,
  ],
  templateUrl: './course-mentor-detail-page.component.html',
  styleUrl: './course-mentor-detail-page.component.scss',
})
export class CourseMentorDetailPageComponent {
  enrollCourseDetail: EnrollCourseMentorDetail | undefined;
  courseMentorId: string | undefined;

  // BEHAVIOR VARIABLES
  blockedUI: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly enrollCourseMentorDetailService: EnrollCourseMentorDetailService,
    private readonly dialogBroadcastService: DialogBroadcastService,
    private route: ActivatedRoute,
    private ngZone: NgZone // Helps Angular recognize external data changes
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id')),
        switchMap((params) => {
          this.courseMentorId = params.get('id')!;
          return of({
            courseMentorId: this.courseMentorId,
          });
        })
      )
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.run(() => {
            this.initData();
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData() {
    this.blockedUI = true;
    const requests = [
      this.enrollCourseMentorDetailService
        .getOfflineEnrolledCourseById(this.courseMentorId!)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        ),
    ];

    const forkJoinSubscription$ = forkJoin(requests).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0] && result[0].status === 200) {
          this.enrollCourseDetail = result[0].data;
          this.scrollToTarget();
          this.blockedUI = false;
        } else {
          this.scrollToTarget();
          this.blockedUI = false;
        }
      });
    });

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
