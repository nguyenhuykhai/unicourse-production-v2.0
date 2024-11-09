import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgZone,
  Output,
} from '@angular/core';
import { CartItem } from '../../core/models';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { Response, Wishlist } from '../../../../common/models';
import { CourseDetailService } from '../../../course-details-page/core/services';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-wishlist-item',
  standalone: true,
  imports: [SharedModule, CommonModule, CurrencyPipe],
  templateUrl: './wishlist-item.component.html',
  styleUrl: './wishlist-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WishlistItemComponent {
  @Input() item: Wishlist | undefined;
  @Output() removeCourse = new EventEmitter<Wishlist>();
  @Output() addToCart = new EventEmitter<Wishlist>();
  public rating: number = 5; // Số lượng sao
  public stars: number[] = Array(this.rating).fill(0);

  constructor(
    private detailService: CourseDetailService,
    private ngZone: NgZone // Giúp Angular nhận biết được sự thay đổi của dữ liệu bên ngoài
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }

  removeCourseInWishList(item: Wishlist) {
    this.removeCourse.emit(item);
  }

  addToCartFromWishlist(item: Wishlist) {
    this.addToCart.emit(item);
  }
}
