import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { LecturerProfileService } from './core/services';
import { filter, map, Subscription, switchMap } from 'rxjs';
import { LecturerProfile } from './core/models';
import { SharedModule } from '../../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

@Component({
  selector: 'app-lecturer-profile-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './lecturer-profile-page.component.html',
  styleUrl: './lecturer-profile-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LecturerProfilePageComponent {
  public lecturerProfile: LecturerProfile | undefined;
  public lecturerId: number | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly lectureProfileService: LecturerProfileService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
      this.initData();
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }

    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        filter((id) => !!id)
      )
      .subscribe((id) => {
        if (isPlatformBrowser(this.platformId)) {
          this.lecturerId = Number(id);
          this.initData();
        }
      });
  }

  initData() {
    this.getLecturerProfileById();
  }

  getLecturerProfileById() {
    // Call service to get lecturer profile by id
    const lecturerProfileSubscription$ = this.lectureProfileService
      .getLecturerById(this.lecturerId as number) 
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.lecturerProfile = res.data;
          }
        },
        error: (err) => {
          console.error('Error fetching lecturer profile', err); // Handle error
        },
      });

    this.subscriptions.push(lecturerProfileSubscription$);
  }

  goToCourseDetail(courseId: number) {
    // Redirect to course detail page
    this.router.navigate([`/courses/${courseId}}`]);
  }
}
