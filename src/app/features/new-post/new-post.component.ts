import { Component, NgZone } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { EditorModule } from '@tinymce/tinymce-angular';
import { environment } from '../../../environments/environment';
import { BlogPayload, Category, User } from '../../common/models';
import { MenuItem, MessageService } from 'primeng/api';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { BlogService, CategoryService, DialogBroadcastService } from '../../common/services';
import { Router } from '@angular/router';
import { PublishDialogComponent } from './publish-dialog/publish-dialog.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-new-post',
  standalone: true,
  imports: [SharedModule, EditorModule, PublishDialogComponent],
  templateUrl: './new-post.component.html',
  styleUrl: './new-post.component.scss'
})
export class NewPostComponent {
  Logo: string = environment.LOGO;
  preview: boolean = true;
  user!: User;
  blogPayload: BlogPayload = {} as BlogPayload;
  originalBlogPayload: BlogPayload = {} as BlogPayload;
  categories: Array<Category> | undefined;
  items: MenuItem[] | undefined;

  // BEHAVIOR VARIABLES
  blockedUI: boolean = true;
  displayDialog: boolean = false;
  publishDialog: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(
    private sanitizer: DomSanitizer,
    private readonly blogService: BlogService,
    private readonly categoryService: CategoryService,
    private dialogBroadcastService: DialogBroadcastService,
    private ngZone: NgZone,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.blockedUI = true;
    const forkJoinSubscription$ = forkJoin([
      this.categoryService.getCategories().pipe(
        catchError((error) => {
          return of(null);
        })
      )
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (
          result[0]?.status === 200
        ) {
          this.categories = result[0].data;
          this.blockedUI = false;
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs) => subs.unsubscribe());
  }

  sanitizeContent(content: any): any {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // Xử lí tạo một blog mới
  handleCreateBlog(event: BlogPayload) {
    const createNewBlogSub$ = this.blogService.postBlog(event).subscribe({
      next: (res) => {
        if (res.status === 201) {
          this.dialogBroadcastService.broadcastConfirmationDialog({
            header: 'Tạo bài viết',
            message: 'Tạo bài viết mới thành công, bài viết của bạn sẽ được kiểm duyệt trước khi được công khai',
            type: 'success',
            return: true,
            numberBtn: 1,
          });
          this.blogPayload = {} as BlogPayload;
          this.publishDialog = false;
        }
      },
      error: (error) => {
        this.dialogBroadcastService.broadcastConfirmationDialog({
          header: 'Tạo bài viết',
          message: 'Tạo bài viết mới không thành công, vui lòng thử lại',
          type: 'error',
          return: false,
          numberBtn: 1,
        });
      }
    });
    this.subscriptions.push(createNewBlogSub$);
  }

  // BEHAVIOR ZONE
  togglePublishDialog() {
    this.originalBlogPayload = cloneDeep(this.blogPayload);
    this.publishDialog = true;
  }

  toggleReviewDialog() {
    this.displayDialog = true;
  }

  onDialogClose(): void {
    this.displayDialog = false;
  }

  onPublishDialogClose(): void {
    this.publishDialog = false;
  }
}
