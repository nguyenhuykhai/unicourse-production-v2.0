import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { UserIntroductionComponent } from './components/user-introduction/user-introduction.component';
import { UserActivitiesComponent } from './components/user-activities/user-activities.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { EnrollCourse, Student, User } from '../../common/models';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { CourseWishlistComponent } from './components/course-wishlist/course-wishlist.component';
import { UserService } from '../../common/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { UserStateService } from '../../common/services';
import { Profile_Mode } from './core/services';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    UserInfoComponent,
    UserIntroductionComponent,
    UserActivitiesComponent,
    CourseListComponent,
    CourseWishlistComponent,
    SharedModule,
  ],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  providers: [UserService],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  student: Student | undefined;
  userLocal: User | undefined;
  unAuthUser: User | undefined;
  userId: string | null = null;
  enrolledCourses: EnrollCourse[] = [];

  // BEHAVIOR VARIABLES
  mode: string | undefined;
  public blockedUI: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly userService: UserService,
    private readonly userStateService: UserStateService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to changes in the route params to detect changes in the userId
      const paramsSub$ = this.route.params.subscribe((params) => {
        this.userId = params['id'];

        // Reinitialize data when the userId changes
        if (localStorage.getItem('isLogin')) {
          this.getAndSetUser();
          this.userLocal?.id == this.userId
            ? this.initData()
            : this.initDataUnAuthUser(this.userId);
        } else {
          this.initDataUnAuthUser(this.userId);
        }
      });

      this.subscriptions.push(paramsSub$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  initData() {
    this.blockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.userService.getStudentProfile().pipe(
        catchError((error) => {
          return of(null);
        })
      ),
      this.userService.getEnrolledCourses().pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      if (result[0]?.status === 200 && result[1]?.status === 200) {
        this.student = result[0].data;
        this.enrolledCourses = result[1].data;
        this.mode = Profile_Mode.AUTH_USER;
        this.blockedUI = false;
      }
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  initDataUnAuthUser(userId: string | null) {
    if (!userId) {
      return;
    }

    this.blockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.userService.getUnAuthUserProfile(userId).pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      if (result[0]?.status === 200) {
        this.unAuthUser = result[0].data;
        this.mode = Profile_Mode.UNAUTH_USER;
        this.blockedUI = false;
      }
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  getAndSetUser(): void {
    const userSub$ = this.userStateService.getUserState().subscribe((user) => {
      if (user) {
        this.ngZone.run(() => {
          this.userLocal = user;
        });
      } else {
        const userLocal = localStorage.getItem('UserInfo');
        if (userLocal) {
          this.ngZone.run(() => {
            this.userLocal = JSON.parse(localStorage.getItem('UserInfo') || '');
            this.userStateService.updateUserState(this.userLocal);
          });
        }
      }
    });
    this.subscriptions.push(userSub$);
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
}
