import { Component, Input, OnChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Blog } from '../../../../common/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
})
export class BlogListComponent implements OnChanges {
  @Input() blocked: boolean | undefined;
  @Input() blogs: Array<Blog> | undefined;

  constructor(private router: Router) {}

  ngOnChanges(): void {
    this.initData();
  }

  initData(): void {}

  navigateToBlogDetail(blog: Blog): void {
    this.router.navigate(['/blog', blog.id], { state: blog });
  }
}
