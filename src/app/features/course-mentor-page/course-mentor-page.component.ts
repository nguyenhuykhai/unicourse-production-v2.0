import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import {
  catchError,
  filter,
  forkJoin,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { CourseMentorService } from '../../common/services/coure-mentor.service';
import { DialogBroadcastService } from '../../common/services';
import { ActivatedRoute } from '@angular/router';
import { CourseMentorDetail } from '../../common/models';
import { SharedModule } from '../../shared/shared.module';
import { CourseMentorContentComponent } from './components/course-mentor-content/course-mentor-content.component';
import { CourseMentorSidebarComponent } from './components/course-mentor-sidebar/course-mentor-sidebar.component';
import { CourseMentorListComponent } from './components/course-mentor-list/course-mentor-list.component';
import { CourseMentorInfoComponent } from './components/course-mentor-info/course-mentor-info.component';
import { CourseDetailService } from '../course-details-page/core/services';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-course-mentor-page',
  standalone: true,
  imports: [
    SharedModule,
    CourseMentorContentComponent,
    CourseMentorSidebarComponent,
    CourseMentorListComponent,
    CourseMentorInfoComponent,
  ],
  templateUrl: './course-mentor-page.component.html',
  styleUrl: './course-mentor-page.component.scss',
})
export class CourseMentorPageComponent {
  courseMentor: CourseMentorDetail | undefined;
  courseId: string | undefined;
  courseMentorId: string | undefined;

  enrollIds: Array<any> = [];

  // BEHAVIOR VARIABLES
  blockedUI: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly courseMentorService: CourseMentorService,
    private readonly courseDetailService: CourseDetailService,
    private readonly dialogBroadcastService: DialogBroadcastService,
    private route: ActivatedRoute,
    private ngZone: NgZone // Helps Angular recognize external data changes
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id') && params.has('course_mentor_id')),
        switchMap((params) => {
          this.courseId = params.get('id')!;
          this.courseMentorId = params.get('course_mentor_id')!;
          return of({
            courseId: this.courseId,
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
      this.courseMentorService
        .getCourseMentorById(this.courseId!, this.courseMentorId!)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        ),
    ];

    // Find enrollId from local storage mapped to the course mentor ID
    const enrollIds = localStorage.getItem('enrollIds');
    if (enrollIds) {
      this.enrollIds = JSON.parse(enrollIds);
    } else if (localStorage.getItem('isLogin')) {
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
        if (result[0] && result[0].status === 200) {
          this.courseMentor = result[0].data;

          // Init enrollIds list if it's not available in local storage
          if (result[1] && result[1].status === 200) {
            this.initEnrollIdsList(result[1].data);
          }
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

  // LOGIC ZONE
  initEnrollIdsList(data: any) {
    if (data && data.length > 0) {
      this.enrollIds = cloneDeep(data);
      localStorage.setItem('enrollIds', JSON.stringify(this.enrollIds));
    }
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
