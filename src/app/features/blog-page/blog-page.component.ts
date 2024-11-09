import { ApplicationRef, Component, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FeaturedBlogComponent } from './components/featured-blog/featured-blog.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { Blog, Filter, PayloadData } from '../../common/models';
import { catchError, first, forkJoin, of, Subscription } from 'rxjs';
import { BlogService } from '../../common/services';
import { isPlatformBrowser } from '@angular/common';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [SharedModule, FeaturedBlogComponent, BlogListComponent],
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
})
export class BlogPageComponent implements OnInit, OnDestroy {
  highlightBlogs: PayloadData<Blog> | undefined;
  normalBlogs: PayloadData<Blog> | undefined;
  public blockedUI: boolean | undefined;
  public normalBlogBlockedUI: boolean | undefined;
  public filter: Filter = {
    page: 1,
    pageSize: 6,
    where: {},
    orderBy: {
      created_at: 'desc',
    },
  };

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private blogService: BlogService,
    private applicationRef: ApplicationRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initData();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData(): void {
    this.blockedUI = true;
    this.normalBlogBlockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.blogService.getBlogs(this.filter).pipe(
        catchError((error) => {
          return of(null);
        })
      ),
      this.blogService
        .getBlogs({
          ...this.filter,
          pageSize: 3,
          where: { is_highlighted: true },
        })
        .pipe(
          catchError((error) => {
            return of(null);
          })
        ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200 && result[1]?.status === 200) {
          this.normalBlogs = result[0].data;
          this.highlightBlogs = result[1].data;
          this.blockedUI = false;
          this.normalBlogBlockedUI = false;
          this.scrollToTarget('targetDiv');
        } else {
          this.blockedUI = false;
          this.normalBlogBlockedUI = false;
          this.scrollToTarget('targetDiv');
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  initNormalBlogData(): void {
    this.normalBlogBlockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.blogService.getBlogs(this.filter).pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200) {
          this.normalBlogs = result[0].data;
          this.normalBlogBlockedUI = false;
          this.scrollToTarget('targetDiv2');
        } else {
          this.normalBlogBlockedUI = false;
          this.scrollToTarget('targetDiv2');
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  // BEHAVIOR ZONE
  onPageChange(event: PaginatorState): void {
    this.filter.page = (event?.page ?? 0) + 1;
    this.initNormalBlogData();
  }

  scrollToTarget(id: string) {
    const targetElement = document.getElementById(`${id}`);
    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200; // Adjust this value as necessary
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
