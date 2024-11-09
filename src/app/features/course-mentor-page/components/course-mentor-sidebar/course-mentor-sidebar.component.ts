import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { Course, CourseMentor, CourseMentorDetail, User } from '../../../../common/models';
import { Subscription } from 'rxjs';
import { DialogBroadcastService, SharedService, UserStateService } from '../../../../common/services';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CourseDetailService } from '../../../course-details-page/core/services';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-course-mentor-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-mentor-sidebar.component.html',
  styleUrl: './course-mentor-sidebar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CourseMentorSidebarComponent implements OnInit, OnDestroy {
  @Input() courseMentor: CourseMentorDetail | undefined;
  @Input() blockedUI: boolean | undefined;
  @Input() enrollIds: Array<any> | undefined;
  user: User | undefined;
  isEnrolledCourse: boolean = false;

  // BEHAVIOR VARIABLES
  loadingEnrollCourse: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly userStateService: UserStateService,
    private readonly detailService: CourseDetailService,
    private dialogBroadcastService: DialogBroadcastService,
    private sharedService: SharedService,
    private ngZone: NgZone, // Giúp Angular nhận biết được sự thay đổi của dữ liệu bên ngoài
    private router: Router
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }

    // Khởi động logic sau khi ứng dụng đã ổn định
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.initData();
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.user = localStorage.getItem('UserInfo')
        ? JSON.parse(localStorage.getItem('UserInfo') || '{}')
        : undefined;
    }
  }

  // LOGIC ZONE
  handleEnrollCourse(course_mentor: CourseMentorDetail) {
    this.loadingEnrollCourse = true;
      const enrollCourseSub$ = this.detailService
        .enrollCourse(course_mentor.id)
        .subscribe({
          next: (res) => {
            if (res.status === 200) {
              this.isEnrolledCourse = true;
              const newEnrollIds = this.enrollIds ? [...this.enrollIds] : [];
              newEnrollIds.push({
                enroll_id: res.data.id,
                course_mentor_id: res.data.course_mentor_id
              });
              localStorage.setItem('enrollIds', JSON.stringify(newEnrollIds));
              this.enrollIds = newEnrollIds;
              const updatedUser: User = cloneDeep(this.user!);
              if (updatedUser.wallet) {
                updatedUser.wallet.balance -= course_mentor.amount;
                localStorage.setItem('UserInfo', JSON.stringify(updatedUser));
                this.userStateService.updateUserState(updatedUser);
              }
              this.loadingEnrollCourse = false;

              // Noti thành công
              this.dialogBroadcastService.broadcastConfirmationDialog({
                header: 'Thông báo',
                message: 'Đăng ký khóa học thành công',
                type: 'success',
                return: false,
                numberBtn: 1,
              });
            }
          },
          error: (error: any) => {
            this.dialogBroadcastService.broadcastConfirmationDialog({
              header: 'Thông báo',
              message: 'Đăng ký khóa học thất bại',
              type: 'error',
              return: false,
              numberBtn: 1,
            });
            this.loadingEnrollCourse = false;
            this.isEnrolledCourse = false;
          },
        });
      this.subscriptions.push(enrollCourseSub$);
  }

  handleBuyCourse(course_mentor: CourseMentorDetail | undefined) {
    if (localStorage === undefined || !course_mentor) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (!localStorage.getItem('isLogin')) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (!this.checkEnoughBalance(course_mentor)) {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Không đủ xu để mua khóa học',
        message: 'Vui lòng nạp thêm xu để mua khóa học',
        type: 'info',
        return: false,
        numberBtn: 1,
      });
      return;
    }

    this.handleEnrollCourse(course_mentor);
  }

  checkEnoughBalance(course_mentor: CourseMentorDetail): boolean {
    if (this.user && this.user.wallet) {
      return this.user.wallet.balance >= course_mentor.amount;
    } else {
      return false;
    }
  }

  checkCourseInEnrollList(course_mentor: CourseMentorDetail | undefined): boolean {
    if (this.enrollIds && this.enrollIds.length > 0) {
      return this.enrollIds.some((item) => item.course_mentor_id === course_mentor?.id);
    }
    return false;
  }
}
