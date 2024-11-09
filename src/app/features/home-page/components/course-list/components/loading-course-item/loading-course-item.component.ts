import { Component } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';

@Component({
  selector: 'app-loading-course-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './loading-course-item.component.html',
  styleUrl: './loading-course-item.component.scss'
})
export class LoadingCourseItemComponent {

}
