import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Blog } from '../../../../common/models';

@Component({
  selector: 'app-featured-blog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './featured-blog.component.html',
  styleUrl: './featured-blog.component.scss'
})
export class FeaturedBlogComponent implements OnChanges {
  @Input() blocked: boolean | undefined;
  @Input() blogs: Array<Blog> | undefined;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {}
}
