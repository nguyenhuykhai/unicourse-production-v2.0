import { ApplicationRef, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Blog, Filter, PayloadData } from '../../common/models';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { BlogService } from '../../common/services';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-question-and-answer-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './question-and-answer-page.component.html',
  styleUrl: './question-and-answer-page.component.scss'
})
export class QuestionAndAnswerPageComponent {
  blogs: PayloadData<Blog> | undefined;
  currentBlog: Blog | undefined;
  public blockedUI: boolean | undefined;
  public filter: Filter = {
    page: 1,
    pageSize: 100,
    where: {
      is_question_marked: true,
    },
    orderBy: {},
  };

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private blogService: BlogService,
    private applicationRef: ApplicationRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
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
    const forkJoinSubscription$ = forkJoin([
      this.blogService.getBlogs(this.filter).pipe(
        catchError((error) => {
          return of(null);
        })
      )
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200) {
          this.blogs = result[0].data;
          this.currentBlog = this.blogs?.data[0];
          this.blockedUI = false;
          this.scrollToTarget('targetDiv');
        } else {
          this.blockedUI = false;
          this.scrollToTarget('targetDiv');
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  // LOGIC ZONE
  setCurrentBlog(blog: Blog): void {
    this.ngZone.run(() => {
      this.currentBlog = blog;
    });
  }

  // Sanitize content and process images
  sanitizeContent(content: any): any {
    if (!content) {
      return '';
    }

    // Adjust width and height attributes in img tags
    const modifiedContent = this.adjustImageAttributes(content);
    return this.sanitizer.bypassSecurityTrustHtml(modifiedContent);
  }

  // Adjust width and height attributes in the content
  adjustImageAttributes(content: string): string {
    return content.replace(/<img[^>]+>/g, (imgTag) => {
      // Remove width and height attributes
      imgTag = imgTag.replace(/width="[^"]*"/g, '');
      imgTag = imgTag.replace(/height="[^"]*"/g, '');
      // Add or update style attribute
      if (imgTag.includes('style="')) {
        imgTag = imgTag.replace(/style="([^"]*)"/, 'style="$1;max-width:100%;height:auto;"');
      } else {
        imgTag = imgTag.replace(/<img/, '<img style="max-width:100%;height:auto;"');
      }
      return imgTag;
    });
  }

  // BEHAVIOR ZONE
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
