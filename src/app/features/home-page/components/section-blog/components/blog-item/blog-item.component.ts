import { Component, Input } from '@angular/core';
import { Blog } from '../../../../../../common/models';
import { SharedModule } from '../../../../../../shared/shared.module';

@Component({
  selector: 'app-blog-item',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './blog-item.component.html',
  styleUrl: './blog-item.component.scss',
})
export class BlogItemComponent {
  @Input() dataBlog: Blog | undefined;
}
