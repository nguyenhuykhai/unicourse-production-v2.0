import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { CourseFilterItem } from '../../../../common/models';

@Component({
  selector: 'app-recommendation-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, SharedModule],
  templateUrl: './recommendation-item.component.html',
  styleUrl: './recommendation-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RecommendationItemComponent {
  @Input() item!: CourseFilterItem;
  public rating: number = 5; // Số lượng sao
  public stars: number[] = Array(this.rating).fill(0);

  constructor() {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }
}
