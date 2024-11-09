import { Component, Input } from '@angular/core';
import { Blog } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-blog-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './blog-header.component.html',
  styleUrl: './blog-header.component.scss'
})
export class BlogHeaderComponent {
  @Input() blog: Blog | undefined;
  @Input() blockedUI: boolean | undefined;

  convertDateToString(date: any): string {
    if(!date) {
      return '';
    }

    const currentDate = new Date();
    const createdDate = new Date(date);
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      return 'hôm nay';
    } else if (diffDays === 1) {
      return 'hôm qua';
    } else {
      return `${diffDays} ngày trước`;
    }
  }
}
