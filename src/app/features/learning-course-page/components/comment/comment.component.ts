import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommentComponent implements OnInit {
  @Output() toggleComments = new EventEmitter<string>();

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }

  handleToggleComments(type: string) {
    this.toggleComments.emit(type);
  }
}
