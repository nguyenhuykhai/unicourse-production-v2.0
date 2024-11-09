import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CartItem } from '../../core/models';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [SharedModule, CommonModule , CurrencyPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartItemComponent implements OnInit, OnChanges {
  @Input() item: CartItem | undefined;
  @Output() addCourseToWishList = new EventEmitter<CartItem>();
  @Output() removeCourseFromCart = new EventEmitter<CartItem>();
  public rating: number = 5; // Số lượng sao
  public stars: number[] = Array(this.rating).fill(0);

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue) {
      this.item = changes['item'].currentValue;
    }
  }

  handleAddCourseToWishList(item: CartItem) {
    this.addCourseToWishList.emit(item);
  }

  handleRemoveCourseFromCart(item: CartItem) {
    this.removeCourseFromCart.emit(item);
  }
}
