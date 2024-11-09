import { Component, Input } from '@angular/core';
import { Blog, PayloadData } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';
import { BlogItemComponent } from './components/blog-item/blog-item.component';

@Component({
  selector: 'app-section-blog',
  standalone: true,
  imports: [SharedModule, BlogItemComponent],
  templateUrl: './section-blog.component.html',
  styleUrl: './section-blog.component.scss',
})
export class SectionBlogComponent {
  @Input() dataBlogs: PayloadData<Blog> | undefined;
}
