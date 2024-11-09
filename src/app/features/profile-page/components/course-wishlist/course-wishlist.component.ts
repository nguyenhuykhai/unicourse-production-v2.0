import { Component, Input } from '@angular/core';
import { Wishlist } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-course-wishlist',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-wishlist.component.html',
  styleUrl: './course-wishlist.component.scss'
})
export class CourseWishlistComponent {
  @Input() wishlistCourses!: Wishlist[];
}
