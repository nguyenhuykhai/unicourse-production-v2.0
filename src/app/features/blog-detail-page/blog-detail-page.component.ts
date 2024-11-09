import {
  AfterViewInit,
  ApplicationRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CommentSidebarComponent } from './components/comment-sidebar/comment-sidebar.component';
import { BlogHeaderComponent } from './components/blog-header/blog-header.component';
import { BlogContentComponent } from './components/blog-content/blog-content.component';
import { HttpClient } from '@angular/common/http';
import { catchError, first, forkJoin, of, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Blog, Filter, PayloadData, User, Comment } from '../../common/models';
import { BlogService, SharedService, UserStateService } from '../../common/services';

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [
    SharedModule,
    CommentSidebarComponent,
    BlogHeaderComponent,
    BlogContentComponent,
  ],
  templateUrl: './blog-detail-page.component.html',
  styleUrl: './blog-detail-page.component.scss',
})
export class BlogDetailPageComponent implements OnInit, AfterViewInit ,OnDestroy {
  user: User | undefined;
  blog: Blog | undefined;
  comments: Array<Comment> | undefined;
  likes: { total_likes: number } | undefined;
  blogId: string | null = null;
  userLiked: { is_liked: boolean } | undefined;

  // BEHAVIOR VARIABLES
  displaySidebar: boolean = false;
  displayDialog: boolean = false;
  public blockedUI: boolean | undefined;
  isFixed = true; // Để theo dõi trạng thái của position

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private applicationRef: ApplicationRef,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private readonly userStateService: UserStateService,
    private readonly blogService: BlogService,
    private sharedService: SharedService
  ) {
    this.blog = this.router.getCurrentNavigation()?.extras.state as Blog;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initUserData();
      if (!this.blog) {
        this.blogId = this.route.snapshot.paramMap.get('id');
        this.initData();
        // Lắng nghe sự kiện scroll khi trang tải xong
        window.addEventListener('scroll', this.onScroll.bind(this));
      } else {
        this.blogId = this.blog.id;
        this.blog = this.blog;
        this.initDataWithBlog();
        // Lắng nghe sự kiện scroll khi trang tải xong
        window.addEventListener('scroll', this.onScroll.bind(this));
        this.blockedUI = false;
      }
    }
  }

  ngAfterViewInit(): void {
    // Use AfterViewInit to ensure DOM is fully loaded
    if (isPlatformBrowser(this.platformId)) {
      this.scrollToTarget('targetDiv');
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // INITIALIZATION ZONE
  // Fetch all data
  initData(): void {
    this.blockedUI = true;
    if (this.blogId) {
      const requests = [
        this.blogService.getBlogById(this.blogId).pipe(
          catchError((error) => {
            return of(null);
          })
        ),
        this.blogService.getBlogComments(this.blogId).pipe(
          catchError((error) => {
            return of(null);
          })
        ),
        this.blogService.getBlogLikes(this.blogId).pipe(
          catchError((error) => {
            return of(null);
          })
        ),
      ];

      // Check if user is logged in, then fetch user liked blog
      if (localStorage.getItem('isLogin')) {
        requests.push(
          this.blogService.getUserLikedBlog(this.blogId).pipe(
            catchError((error) => {
              return of(null);
            })
          )
        );
      }

      const forkJoinSubscription$ = forkJoin(requests).subscribe((result) => {
        this.ngZone.run(() => {
          if (
            result[0] &&
            result[1] &&
            result[2] &&
            result[0].status === 200 &&
            result[1].status === 200 &&
            result[2].status === 200
          ) {
            this.blog = result[0].data as Blog;
            this.comments = result[1].data as Comment[];
            this.likes = result[2].data;
            if (result[3] && result[3].status === 200) {
              this.userLiked = result[3].data;
            }
            this.blockedUI = false;
          } else {
            this.blockedUI = false;
          }
        });
      });

      this.subscriptions.push(forkJoinSubscription$);
    }
  }

  // Fetch comments and likes only
  initDataWithBlog(): void {
    this.blockedUI = true;
    if (this.blogId) {
      const requests = [
        this.blogService.getBlogComments(this.blogId).pipe(
          catchError((error) => {
            return of(null);
          })
        ),
        this.blogService.getBlogLikes(this.blogId).pipe(
          catchError((error) => {
            return of(null);
          })
        ),
      ];

      // Check if user is logged in, then fetch user liked blog
      if (localStorage.getItem('isLogin')) {
        requests.push(
          this.blogService.getUserLikedBlog(this.blogId).pipe(
            catchError((error) => {
              return of(null);
            })
          )
        );
      }

      const forkJoinSubscription$ = forkJoin(requests).subscribe((result) => {
        this.ngZone.run(() => {
          if (result[0] && result[1] && result[0].status === 200 && result[1].status === 200) {
            this.comments = result[0].data as Comment[];
            this.likes = result[1].data;
            if (result[2] && result[2].status === 200) {
              this.userLiked = result[2].data;
            }
            this.blockedUI = false;
          } else {
            this.blockedUI = false;
          }
        });
      });
      this.subscriptions.push(forkJoinSubscription$);
    }
  }

  // Init user data
  initUserData(): void {
    const userSub$ = this.userStateService.getUserState().subscribe((user) => {
      if (user) {
        this.ngZone.run(() => {
          this.user = user;
        });
      } else {
        const userLocal = localStorage.getItem('UserInfo');
        if (userLocal) {
          this.ngZone.run(() => {
            this.user = JSON.parse(localStorage.getItem('UserInfo') || '');
            this.userStateService.updateUserState(this.user);
          });
        }
      }
    });
    this.subscriptions.push(userSub$);
  }

  // LOGIC ZONE
  handleAddComment(content: string): void {
    if (content !== '' && content !== null && this.blogId) {
      const body = { content };
      const addCommentSub$ = this.blogService
        .postComment(this.blogId, body)
        .subscribe({
          next: (result) => {
            if (result.status === 201) {
              this.ngZone.run(() => {
                this.comments !== undefined
                  ? this.comments.push(result.data)
                  : (this.comments = [result.data]);
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      this.subscriptions.push(addCommentSub$);
    }
  }

  handleUpdateComment(editComment: Comment) {
    if (editComment.id && this.blogId) {
      const body = { content: editComment.content };
      const updateSub$ = this.blogService
        .updateComment(this.blogId, editComment.id, body)
        .subscribe({
          next: (result) => {
            if (result.status === 201) {
              this.ngZone.run(() => {
                if (this.comments) {
                  this.comments = this.comments.map((comment) => {
                    if (comment.id === editComment.id) {
                      return editComment;
                    }
                    return comment;
                  });
                }
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      this.subscriptions.push(updateSub$);
    }
  }

  handleLikeBlog(): void {
    if (!this.user) {
      this.sharedService.turnOnSignInDialog();
      return;
    }

    if (this.blogId) {
      const likeSub$ = this.blogService.postLike(this.blogId).subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            if (result.status === 201 && this.likes) {
              if (result.data === false) {
                this.likes = { total_likes: this.likes.total_likes - 1 };
                this.userLiked = { is_liked: false };
              } else {
                this.likes = { total_likes: this.likes.total_likes + 1 };
                this.userLiked = { is_liked: true };
              }
            }
          });
        },
        error: (error) => {
          console.error(error);
        },
      });
      this.subscriptions.push(likeSub$);
    }
  }

  handleDeleteComment(commentId: string): void {
    if (this.blogId) {
      const deleteSub$ = this.blogService
        .deleteComment(this.blogId, commentId)
        .subscribe({
          next: (result) => {
            if (result.status === 201) {
              this.ngZone.run(() => {
                if (this.comments) {
                  this.comments = this.comments.filter(
                    (comment) => comment.id !== commentId
                  );
                }
              });
            }
          },
          error: (error) => {
            console.error(error);
          },
        });
      this.subscriptions.push(deleteSub$);
    }
  }

  // BEHAVIOR ZONE
  convertDateToString(date: any): string {
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

  toggleComments(type: string): void {
    if (type === 'mobile') {
      this.displayDialog = true; // Show dialog on mobile
    } else {
      this.displaySidebar = true; // Show sidebar on desktop
    }
  }

  onDialogClose(): void {
    this.displayDialog = false;
  }

  onSidebarClose(): void {
    this.displaySidebar = false;
  }

  onScroll(): void {
    // Lấy các phần tử cần thiết
    const commentContainer = document.querySelector(
      '.blog-detail__comment-container__x'
    ) as HTMLElement;
    const blogDetail = document.querySelector('.blog-detail') as HTMLElement;
    const footer = document.querySelector('footer') as HTMLElement;

    if (!commentContainer || !blogDetail || !footer) return;

    // Lấy khoảng cách từ footer đến đỉnh của viewport
    const footerTop = footer.getBoundingClientRect().top;

    // Nếu khoảng cách từ footer đến viewport nhỏ hơn hoặc bằng 300px
    if (footerTop <= 300) {
      // Điều chỉnh vị trí của commentContainer sao cho nằm ngay trên footer
      commentContainer.style.position = 'fixed';
      commentContainer.style.top = `${footerTop - 300}px`; // Giữ khoảng cách nhỏ với footer
      this.isFixed = false;
    } else {
      // Nếu không chạm đến footer, đặt lại vị trí của commentContainer
      commentContainer.style.position = 'fixed';
      commentContainer.style.top = '116px'; // Vị trí mặc định khi cuộn
      this.isFixed = true;
    }
  }

  scrollToTarget(id: string) {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const targetElement = document.getElementById(`${id}`);
        if (targetElement) {
          const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
          const offset = 200; // Adjust this value as necessary
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth',
          });
        }
      }, 0); // Timeout ensures DOM is fully rendered before scrolling
    });

    // const targetElement = document.getElementById(`${id}`);
    // if (targetElement) {
    //   const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    //   const offset = 200; // Adjust this value as necessary
    //   window.scrollTo({
    //     top: elementPosition - offset,
    //     behavior: 'smooth',
    //   });
    // }
  }
}
