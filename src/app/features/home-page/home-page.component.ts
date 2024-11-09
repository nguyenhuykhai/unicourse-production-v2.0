import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CarouselBannerComponent } from './components/carousel-banner/carousel-banner.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { BecomingLecturerComponent } from './components/becoming-lecturer/becoming-lecturer.component';
import { CourseFeedbackComponent } from './components/course-feedback/course-feedback.component';
import { Banner } from './core/models';
import { SectionBackgroundComponent } from './components/section-background/section-background.component';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { CourseService } from '../../common/services/course.service';
import { Blog, CourseFilterResponse, Feedback, Filter, PayloadData } from '../../common/models';
import { PaginatorState } from 'primeng/paginator';
import { BannerService } from './core/services';
import { FeedbackService } from '../../common/services/feedback.service';
import { SectionBlogComponent } from './components/section-blog/section-blog.component';
import { BlogService } from '../../common/services';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    SharedModule,
    CarouselBannerComponent,
    CourseListComponent,
    BecomingLecturerComponent,
    CourseFeedbackComponent,
    SectionBackgroundComponent,
    SectionBlogComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageComponent implements OnInit {
  public freeCourses!: CourseFilterResponse;
  public feeCourses!: CourseFilterResponse;
  public banners: Banner[] = [];
  public highlightFeedbacks: Feedback[] = [];
  public dataBlogs: PayloadData<Blog> | undefined;

  // BEHAVIOR DATA
  public blockedUI: boolean = true;
  public freeCourseLoading: boolean = false;
  public feeCourseLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  public filterFreeCourses: Filter = {
    page: 1,
    pageSize: 4,
    where: {
      status: {
        equals: 'PUBLISHED',
      },
      price: {
        lte: 0,
      },
    },
    orderBy: {
      price: 'asc',
    },
  };

  public filterFeeCourses: Filter = {
    page: 1,
    pageSize: 4,
    where: {
      status: {
        equals: 'PUBLISHED',
      },
      price: {
        gt: 0,
      }
    },
    orderBy: {
      price: 'desc',
    },
  };

  public filterBlogs: Filter = {
    page: 1,
    pageSize: 3,
    where: {},
    orderBy: {
      created_at: 'desc',
    },
  };

  constructor(private readonly courseService: CourseService, 
    private readonly bannerService: BannerService,
    private readonly feedbackService: FeedbackService,
    private readonly blogService: BlogService,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
      this.initData();
    } else {
      console.warn('Custom Elements are not supported in this environment.');
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

  initData() {
    const forkJoinSubscription$ = forkJoin([
      this.courseService
        .getCourseFilter(this.filterFreeCourses)
        .pipe(
          catchError((error) => {
            console.error('Error fetching free courses', error); // Handle error
            return of(null);
          })
        ),
      this.courseService
        .getCourseFilter(this.filterFeeCourses)
        .pipe(
          catchError((error) => {
            console.error('Error fetching fee courses', error); // Handle error
            return of(null);
          })
        ),
    ]).subscribe((result) => {
      if (result[0]?.status === 200 && result[1]?.status === 200) {
        this.freeCourses = result[0].data;
        this.feeCourses = result[1].data;
        this.blockedUI = false;
      } else {
        console.error('Error fetching courses data'); // Handle potential errors
        this.blockedUI = false;
      }
    });

    // Get all banners
    const bannersSubscription$ = this.bannerService.getAllBanners().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.banners = Array.isArray(res.data) ? res.data : [];
        }
      },
      error: (err) => {
        console.error('Error fetching banners', err); // Handle error
      },
    });


    // Get all highlight feedbacks
    const highlightFeedbackSubscription$ = this.feedbackService.getAllHighLightFeedback().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.highlightFeedbacks = Array.isArray(res.data) ? res.data : [];
        }
      },
      error: (err) => {
        console.error('Error fetching highlight feedbacks', err); // Handle error
      },
    });

    // Get Blog data
    this.initNormalBlogData();

    this.subscriptions.push(forkJoinSubscription$);
    this.subscriptions.push(bannersSubscription$);
    this.subscriptions.push(highlightFeedbackSubscription$);
  }

  onFreePageChange(event: PaginatorState) {
    if (this.freeCourseLoading) {
      return;
    }

    this.freeCourseLoading = true;
    this.filterFreeCourses.page = (event?.page ?? 0) + 1;
    const initfreeCoursesSubscription$ = this.courseService.getCourseFilter(this.filterFreeCourses).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.freeCourses = res.data;
          this.freeCourseLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching free courses', err); // Handle error
      },
    });

    this.subscriptions.push(initfreeCoursesSubscription$);
  }

  onFeePageChange(event: PaginatorState) {
    if (this.feeCourseLoading) {
      return;
    }

    this.feeCourseLoading = true;
    this.filterFeeCourses.page = (event?.page ?? 0) + 1;
    const initFeeCoursesSubscription$ = this.courseService.getCourseFilter(this.filterFeeCourses).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.feeCourses = res.data;
          this.feeCourseLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching fee courses', err); // Handle error
      },
    });

    this.subscriptions.push(initFeeCoursesSubscription$);
  }

   initNormalBlogData(): void {
    const forkJoinSubscription$ = forkJoin([
      this.blogService.getBlogs(this.filterBlogs).pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200) {
          this.dataBlogs = result[0].data;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }
}
