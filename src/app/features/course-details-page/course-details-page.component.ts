import {
  ApplicationRef,
  Component,
  Inject,
  NgZone,
  PLATFORM_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CourseSidebarComponent } from './components/course-sidebar/course-sidebar.component';
import { SharedModule } from '../../shared/shared.module';
import { CourseRequirementsComponent } from './components/course-requirements/course-requirements.component';
import { CourseMainContentComponent } from './components/course-main-content/course-main-content.component';
import { CourseDescriptionComponent } from './components/course-description/course-description.component';
import { CourseContentComponent } from './components/course-content/course-content.component';
import { CourseInstructorComponent } from './components/course-instructor/course-instructor.component';
import { CourseReviewsComponent } from './components/course-reviews/course-reviews.component';
import {
  catchError,
  filter,
  first,
  forkJoin,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { CourseDetailService } from './core/services';
import { ActivatedRoute } from '@angular/router';
import { Feedbacks } from './core/models';
import { Course, Lecturer } from '../../common/models';
import { cloneDeep } from 'lodash';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-course-details-page',
  standalone: true,
  imports: [
    CourseSidebarComponent,
    SharedModule,
    CourseRequirementsComponent,
    CourseMainContentComponent,
    CourseDescriptionComponent,
    CourseContentComponent,
    CourseInstructorComponent,
    CourseReviewsComponent,
  ],
  templateUrl: './course-details-page.component.html',
  styleUrls: ['./course-details-page.component.scss'],
})
export class CourseDetailsPageComponent implements OnInit, OnDestroy {
  courseId!: string;
  feedbacks: Array<Feedbacks> = [];
  course!: Course;
  lecturer!: Lecturer;
  enrollIds: Array<any> = [];
  public blockedUI: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly courseDetailService: CourseDetailService,
    private route: ActivatedRoute,
    private applicationRef: ApplicationRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id')),
        switchMap((params) => of(params.get('id') as string))
      )
      .subscribe((id) => {
        if (isPlatformBrowser(this.platformId)) {
          this.courseId = id!;
          this.initData();
        }
      });
  }

  initData() {
    const requests = [
      this.courseDetailService.getCourseById(this.courseId).pipe(
        catchError((error) => {
          console.error('Error fetching course:', error);
          return of(null);
        })
      ),
      this.courseDetailService.getFeedbackByCourseId(this.courseId).pipe(
        catchError((error) => {
          console.error('Error fetching feedback:', error);
          return of(null);
        })
      ),
    ];

    if (localStorage.getItem('isLogin')) {
      requests.push(
        this.courseDetailService.getEnrollIdsList().pipe(
          catchError((error) => {
            console.error('Error fetching enroll IDs:', error);
            return of(null);
          })
        )
      );
    }

    const forkJoinSubscription$ = forkJoin(requests).subscribe((result) => {
      this.ngZone.run(() => {
        if (
          result[0] &&
          result[1] &&
          result[0].status === 200 &&
          result[1].status === 200
        ) {
          const courseData = result[0].data as Course;
          const feedbacksData = result[1].data as Feedbacks[];

          this.course = courseData;
          this.feedbacks = feedbacksData;

          if (courseData && courseData.lecture_id) {
            this.initLectureData(courseData.lecture_id);
          }

          if (result[2]?.status === 200) {
            this.initEnrollIdsList(result[2].data);
          }

          this.blockedUI = false;
          this.scrollToTarget();
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  initLectureData(lectureId: any) {
    const lectureSubscription$ = this.courseDetailService
      .getLectureInfoByLectureId(lectureId)
      .subscribe((result) => {
        this.ngZone.run(() => {
          if (result?.status === 200) {
            this.lecturer = result.data;
          }
          this.blockedUI = false;
        });
      });
    this.subscriptions.push(lectureSubscription$);
  }

  initEnrollIdsList(data: any) {
    if (data && data.length > 0) {
      this.enrollIds = cloneDeep(data);
      localStorage.setItem('enrollIds', JSON.stringify(this.enrollIds));
    }
  }

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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
