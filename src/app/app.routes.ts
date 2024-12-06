import { Routes } from '@angular/router';
import {AuthGuard } from './cores/helpers/auth.interceptor';
import { JwtInterceptor } from './cores/helpers/jwt.interceptor';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/default-layout/default-layout.component').then(
        (m) => m.DefaultLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          )
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./features/about-us-page/about-us-page.component').then(
            (m) => m.AboutUsPageComponent
          )
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./features/blog-page/blog-page.component').then(
            (m) => m.BlogPageComponent
          )
      },
      {
        path: 'blog/:id',
        loadComponent: () =>
          import('./features/blog-detail-page/blog-detail-page.component').then(
            (m) => m.BlogDetailPageComponent
          )
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact-page/contact-page.component').then(
            (m) => m.ContactPageComponent
          )
      },
      {
        path: 'qna',
        loadComponent: () =>
          import(
            './features/question-and-answer-page/question-and-answer-page.component'
          ).then((m) => m.QuestionAndAnswerPageComponent)
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import(
            './features/course-details-page/course-details-page.component'
          ).then((m) => m.CourseDetailsPageComponent)
      },
      {
        path: 'profile/:id',
        loadComponent: () =>
          import('./features/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent
          ),
          canActivate: [AuthGuard],
      },
      {
        path: 'profile/:id/cart',
        loadComponent: () =>
          import('./features/cart-page/cart-page.component').then(
            (m) => m.CartPageComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'course-mentor/:id/:course_mentor_id',
        loadComponent: () =>
          import(
            './features/course-mentor-page/course-mentor-page.component'
          ).then((m) => m.CourseMentorPageComponent)
      },
      {
        path: 'setting/personal',
        loadComponent: () =>
          import(
            './features/setting-personal-page/setting-personal-page.component'
          ).then((m) => m.SettingPersonalPageComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'my-courses',
        loadComponent: () =>
          import(
            './features/learning-progress-page/learning-progress-page.component'
          ).then((m) => m.LearningProgressPageComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./features/wallet-page/wallet-page.component').then(
            (m) => m.WalletPageComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'transaction-history',
        loadComponent: () =>
          import(
            './features/transaction-history-page/transaction-history-page.component'
          ).then((m) => m.TransactionHistoryPageComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'deposit',
        loadComponent: () =>
          import('./features/deposit-page/deposit-page.component').then(
            (m) => m.DepositPageComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'new-post',
        loadComponent: () =>
          import('./features/new-post/new-post.component').then(
            (m) => m.NewPostComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'lecturer/:id',
        loadComponent: () =>
          import('./features/lecturer-profile-page/lecturer-profile-page.component').then(
            (m) => m.LecturerProfilePageComponent
          )
      },
      {
        path: 'accomplishments',
        loadComponent: () =>
          import(
            './features/accomplishment-page/accomplishment-page.component'
          ).then((m) => m.AccomplishmentPageComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'policy',
        loadComponent: () =>
          import('./features/policy-page/policy-page.component').then(
            (m) => m.PolicyPageComponent
          )
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar-page/calendar-page.component').then(
            (m) => m.CalendarPageComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'calendar/:id',
        loadComponent: () =>
          import('./features/course-mentor-detail-page/course-mentor-detail-page.component').then(
            (m) => m.CourseMentorDetailPageComponent
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'learning-course/:id/:course_mentor_id',
    loadComponent: () =>
      import(
        './features/learning-course-page/learning-course-page.component'
      ).then((m) => m.LearningCoursePageComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
  },
];
