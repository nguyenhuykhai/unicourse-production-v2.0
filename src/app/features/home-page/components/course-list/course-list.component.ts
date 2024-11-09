import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { Course, CourseFilterResponse } from '../../../../common/models';
import { CourseItemComponent } from './components/course-item/course-item.component';
import { In } from '@lordicon/element';
import { LoadingCourseItemComponent } from "./components/loading-course-item/loading-course-item.component";

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [SharedModule, CourseItemComponent, LoadingCourseItemComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent {
  @Input() public courses: CourseFilterResponse | undefined;
  @Input() blockedUI: boolean | undefined;
  @Input() feeCourseLoading: boolean | undefined;
  @Input() freeCourseLoading: boolean | undefined;

  constructor() {}

  ngOnInit() {}
}
