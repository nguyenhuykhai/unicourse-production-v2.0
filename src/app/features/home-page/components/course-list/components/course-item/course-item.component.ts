import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Router } from '@angular/router';
import { CourseFilterItem } from '../../../../../../common/models';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

@Component({
  selector: 'app-course-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-item.component.html',
  styleUrl: './course-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseItemComponent {
  @Input() public courseItem!: CourseFilterItem;
  public rating: number = 5; // Số lượng sao
  public stars: number[] = Array(this.rating).fill(0);

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    }
  }

  redirectToCourseDetail(data: CourseFilterItem) {
    this.router.navigate([`/courses/${data.id}`]);
  }

  // Implement sau
  redirectToLearningCourse() {}
}
