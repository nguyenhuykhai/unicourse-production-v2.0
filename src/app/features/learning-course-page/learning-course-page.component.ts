import {
  ApplicationRef,
  Component,
  Inject,
  NgZone,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LearningCourseHeaderComponent } from './components/learning-course-header/learning-course-header.component';
import { LearningCourseSidebarComponent } from './components/learning-course-sidebar/learning-course-sidebar.component';
import { LearningCourseContentComponent } from './components/learning-course-content/learning-course-content.component';
import { LearningCourseFooterComponent } from './components/learning-course-footer/learning-course-footer.component';
import {
  catchError,
  filter,
  first,
  forkJoin,
  of,
  skip,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import { CourseMentorService } from '../../common/services/coure-mentor.service';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Chapter, CourseMentorDetail, Topic, Video } from '../../common/models';
import { SafeResourceUrl } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';
import { ConfirmDialogComponent } from '../../shared/layouts/default-layout/confirm-dialog/confirm-dialog.component';
import { LearningService, TopicCommentService } from './core/services';
import {
  LearningItem,
  LearningProgress,
  RequestAmendAndCompleteTopicLearningProgress,
  TopicComment,
  TopicCommentRequest,
} from './core/models';
import { DialogBroadcastService } from '../../common/services';
import { ChatBotComponent } from './components/chat-bot/chat-bot.component';
import { CommentComponent } from "./components/comment/comment.component";
import { CommentBodyComponent } from './components/comment-body/comment-body.component';
import { Helpers } from '../../cores/utils';
import { DevtoolsDebuggingService } from '../../common/services/devtools-debugging.service';

@Component({
  selector: 'app-learning-course-page',
  standalone: true,
  imports: [
    SharedModule,
    LearningCourseHeaderComponent,
    LearningCourseSidebarComponent,
    LearningCourseContentComponent,
    LearningCourseFooterComponent,
    ConfirmDialogComponent,
    ChatBotComponent,
    CommentComponent,
    CommentBodyComponent
],
  templateUrl: './learning-course-page.component.html',
  styleUrls: ['./learning-course-page.component.scss'], // Notice the change from styleUrl to styleUrls
})
export class LearningCoursePageComponent implements OnInit, OnDestroy {
  courseMentor: CourseMentorDetail | undefined;
  courseId: string | undefined;
  courseMentorId: string | undefined;
  currentChapter: Chapter | undefined;
  currentTopic: Topic | undefined;
  previousTopic: Topic | undefined;
  nextTopic: Topic | undefined;

  // LEARNING PROGRESS VARIABLES
  enrollId: string | undefined;
  learningProgress: LearningProgress | undefined;

  // QUESTION STATE VARIABLES
  questionState: string = 'NOT_STARTED'; // NOT_STARTED, IN_PROGRESS, COMPLETED

  // COMMENT VARIABLES
  displaySidebar: boolean = false;
  displayDialog: boolean = false;
  comments: Array<TopicComment> | undefined;
  requestFetchChildren: TopicComment | undefined;
  blockedUIComment: boolean = false;
  preventEventComment: boolean = false;

  // BEHAVIOR VARIABLES
  blockedUI: boolean = false;
  videoObject: Video | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly courseMentorService: CourseMentorService,
    private readonly learningService: LearningService,
    private readonly dialogBroadcastService: DialogBroadcastService,
    private readonly topicCommentService: TopicCommentService,
    private route: ActivatedRoute,
    private ngZone: NgZone, // Helps Angular recognize external data changes
    private devtoolsDebuggingService: DevtoolsDebuggingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id') && params.has('course_mentor_id')),
        switchMap((params) => {
          this.courseId = params.get('id')!;
          this.courseMentorId = params.get('course_mentor_id')!;
          return of({
            courseId: this.courseId,
            courseMentorId: this.courseMentorId,
          });
        })
      )
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.ngZone.run(() => {
            this.initDevToolsStateSubscription();          
            this.initData();
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData() {
    this.blockedUI = true;

    // Find enrollId from local storage mapped to the course mentor ID
    const enrollIds = localStorage.getItem('enrollIds');
    if (enrollIds) {
      JSON.parse(enrollIds).find((item: any) => {
        if (item.course_mentor_id == this.courseMentorId) {
          this.enrollId = item.enroll_id;
        }
      });
    }

    const forkJoinSubscription$ = forkJoin([
      this.courseMentorService
        .getCourseMentorById(this.courseId!, this.courseMentorId!)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        ),
      this.learningService.getLearningProgress(this.courseMentorId!).pipe(
        catchError((error) => {
          return of(null);
        })
      ),
    ]).subscribe((result) => {
      this.ngZone.run(() => {
        if (result[0]?.status === 200 && result[1]?.status === 200) {
          this.learningProgress = result[1].data;
          this.learningProgress!.totalCompletedTopic =
            this.learningProgress?.learning_progress.length || 0;
          this.mappingDataWithLearningProgress(result[0].data, result[1].data);
          this.blockedUI = false;
        } else {
          this.blockedUI = false;
        }
      });
    });

    this.subscriptions.push(forkJoinSubscription$);
  }

  private initDevToolsStateSubscription(): void {
    // Lắng nghe trạng thái DevTools liên tục
    this.devtoolsDebuggingService.ngOnInit();
  }
  

  mappingDataWithLearningProgress(
    courseMentor: CourseMentorDetail,
    learningProgress: LearningProgress
  ) {
    if (!courseMentor.chapter || courseMentor.chapter.length === 0) {
      this.videoObject = undefined;
    }

    // Sort chapter and topic by position
    courseMentor.chapter?.sort(
      (a: Chapter, b: Chapter) => a.position - b.position
    );

    courseMentor.chapter?.map((item: Chapter) => {
      item.topic?.sort((a: Topic, b: Topic) => a.position - b.position);
    });

    learningProgress.learning_progress.sort(
      (a: LearningItem, b: LearningItem) =>
        a.chapter_position - b.chapter_position
    );

    // Case 1: First time learning
    if (
      courseMentor.chapter &&
      courseMentor.chapter.length > 0 &&
      learningProgress.learning_progress.length === 0
    ) {
      courseMentor.chapter[0].topic[0].isCompleted = true;
      courseMentor.chapter[0].isCompleted = courseMentor.chapter[0].topic.every(
        (topic: Topic) => topic.isCompleted
      );
      courseMentor.chapter[0].expanded = true;
      this.courseMentor = courseMentor;
      this.videoObject =
        courseMentor.chapter[0]?.topic[0]?.element_topic?.video;
      this.currentChapter = courseMentor.chapter[0];
      this.currentTopic = courseMentor.chapter[0]?.topic[0];

      // Call API amend learning progress, if the topic has video or document
      if (
        this.currentTopic.element_topic?.video ||
        this.currentTopic.element_topic?.document
      ) {
        this.handleCompleteTopicLearningProgress(this.currentTopic.id!);
      }
    }

    // Case 2: Learning progress exists
    if (
      courseMentor.chapter &&
      courseMentor.chapter.length > 0 &&
      learningProgress.learning_progress.length > 0
    ) {
      this.courseMentor = courseMentor;
      const lastTopic: LearningItem =
        learningProgress.learning_progress[
          learningProgress.learning_progress.length - 1
        ];
      this.courseMentor.chapter?.map((item: Chapter) => {
        if (item.position <= lastTopic.chapter_position) {
          item.topic?.map((topic: Topic) => {
            if (item.position < lastTopic.chapter_position) { // Check if the chapter position < last chapter position
              topic.isCompleted = true;
            }

            if (item.position === lastTopic.chapter_position) { // Check if the chapter position === last chapter position
              if (topic.position <= lastTopic.topic_position) {
                topic.isCompleted = true;
                if (topic.id === lastTopic.topic_id) {
                  this.videoObject = topic.element_topic?.video;
                  this.currentChapter = item;
                  this.currentTopic = topic;
                  item.expanded = true;
                }
              } else {
                topic.isCompleted = false;
              }
            }
          });
          item.isCompleted = item.topic?.every(
            (topic: Topic) => topic.isCompleted
          );
        } else {
          item.isCompleted = false;
        }
      });
    }
    this.scrollToTarget();
    this.blockedUI = false;
  }

  handleCompleteTopicLearningProgress(topic_id: string) {
    if (!this.enrollId) {
      return;
    }

    const body: RequestAmendAndCompleteTopicLearningProgress = {
      topicId: topic_id,
      enrollCourseId: this.enrollId!,
    };
    const completeLearningProgressSub$ = this.learningService
      .amendLearningProgress(body)
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.learningProgress!.totalCompletedTopic =
              this.learningProgress!.totalCompletedTopic! + 1;

              this.learningProgress?.totalCompletedTopic === this.learningProgress?.totalTopic && this.markCourseAsCompleted(this.enrollId);
          });
        },
        error: (error) => {
          console.error('Error amending learning progress:', error);
        },
      });
    this.subscriptions.push(completeLearningProgressSub$);
  }

  // LOGIC ZONE
  handleQuestionStateChange(event: string) {
    this.questionState = event;
  }

  handleAddCommentTopic(data: TopicCommentRequest) {
    if (!this.currentTopic) {
      return;
    }

    this.preventEventComment = true;
    const addCommentSub$ = this.topicCommentService
      .addTopicComment({
        topic_id: this.currentTopic.id,
        content: data.content
      })
      .subscribe({
        next: (res) => {
          if (res.status === 201) {
            this.ngZone.run(() => {
              this.comments ? this.comments.unshift(res.data) : this.comments = [res.data];
              this.preventEventComment = false;
            });
          }
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.preventEventComment = false;
        },
      });
    this.subscriptions.push(addCommentSub$);
  }

  markCourseAsCompleted(enrollId: string | undefined) {
    if (!enrollId) {
      return;
    }

    const markCourseAsCompletedSub$ = this.learningService.markedCompleteLearningProgress(enrollId).subscribe({
      next: (res) => {},
      error: (error) => {
        console.error('Error marking course as completed:', error);
      },
    });
    this.subscriptions.push(markCourseAsCompletedSub$);
  }

  // BEHAVIOR ZONE
  handleMoveLesson(lesson: Topic) {
    if (this.checkCanMoveLesson(lesson)) {
      const findChapter: Chapter | undefined = this.courseMentor?.chapter?.find(
        (item: Chapter) => item.id === lesson.chapter_id
      );
      // Init new lesson and chapter
      this.currentChapter = cloneDeep(findChapter);
      this.currentTopic = cloneDeep(lesson);
      this.videoObject = lesson.element_topic?.video;

      // Call API amend learning progress
      if (!lesson.isCompleted) {
        this.handleCompleteTopicLearningProgress(lesson.id!);
      }

      // Update status of topic and chapter
      this.courseMentor?.chapter?.map((item: Chapter) => {
        if (item.id === lesson.chapter_id) {
          item.expanded = true;
          item.topic.find(
            (topic: Topic) => topic.id === lesson.id
          )!.isCompleted = true;
          item.isCompleted = item.topic.every(
            (topic: Topic) => topic.isCompleted
          );
        } else {
          item.expanded = false;
        }
      });
    } else {
      this.dialogBroadcastService.broadcastConfirmationDialog({
        header: 'Thông báo',
        message: 'Bạn cần hoàn thành bài học trước để tiếp tục',
        type: 'error',
        return: false,
        numberBtn: 1,
      });
    }
  }

  // Check lesson move inside learning course or next topic
  checkCanMoveLesson(lesson: Topic): boolean {
    if (lesson.isCompleted) {
      return true;
    }

    const findChapter = this.courseMentor?.chapter?.find(
      (item: Chapter) => item.id === lesson.chapter_id
    );
    const previousOfFindChapter = this.courseMentor?.chapter?.find(
      (item: Chapter) => item.position === findChapter!.position - 1
    );
    const firstChapterNotCompleted = this.courseMentor?.chapter?.find(
      (item: Chapter) => !item.isCompleted
    );
    // Case 1: findChapter === currentChapter
    if (findChapter && findChapter.id === this.currentChapter?.id) {
      const firstNotCompletedTopic = findChapter.topic?.find(
        (item: Topic) => !item.isCompleted
      )?.position;

      // Check firstNotCompletedTopic is the next topic of the current topic
      if (firstNotCompletedTopic === lesson.position) {
        return true;
      } else {
        return false;
      }
    }

    // Case 2: firstChapterNotCompleted >= currentChapter
    // - Case 2-1: firstChapterNotCompleted === currentChapter, then check lesson position === 1, then return true
    // - Case 2-2: firstChapterNotCompleted > currentChapter, then return true
    if (
      findChapter &&
      findChapter.position &&
      firstChapterNotCompleted?.position &&
      findChapter.position <= firstChapterNotCompleted?.position
    ) {
      // Case 2-1
      if (findChapter.position === firstChapterNotCompleted.position) {
        if (lesson.position === 1) {
          return true;
        } else {
          return false;
        }
      }

      // Case 2-2
      return true;
    }

    return false;
  }

  handleMoveNextOrPrevLesson(enumType: string) {
    switch (enumType) {
      case 'PREV':
        this.handleMovePrevLesson();
        break;
      case 'NEXT':
        this.handleMoveNextLesson();
        break;
      default:
        break;
    }
  }

  handleMovePrevLesson() {
    if (this.currentTopic?.position === 1) {
      const previousChapter = this.courseMentor?.chapter?.find(
        (item: Chapter) => item.position === this.currentChapter!.position - 1
      );
      if (previousChapter) {
        this.handleMoveLesson(
          previousChapter.topic[previousChapter.topic.length - 1]
        );
      }
    } else {
      const previousTopic = this.currentChapter?.topic?.find(
        (item: Topic) => item.position === this.currentTopic!.position - 1
      );
      if (previousTopic) {
        this.handleMoveLesson(previousTopic);
      }
    }
  }

  handleMoveNextLesson() {
    if (this.currentTopic?.position === this.currentChapter?.topic?.length) {
      const nextChapter = this.courseMentor?.chapter?.find(
        (item: Chapter) => item.position === this.currentChapter!.position + 1
      );
      if (nextChapter) {
        this.handleMoveLesson(nextChapter.topic[0]);
      }
    } else {
      const nextTopic = this.currentChapter?.topic?.find(
        (item: Topic) => item.position === this.currentTopic!.position + 1
      );
      if (nextTopic) {
        this.handleMoveLesson(nextTopic);
      }
    }
  }

  toggleComments(type: string): void {
    if (type === 'mobile') {
      this.displayDialog = true; // Show dialog on mobile
    } else {
      this.displaySidebar = true; // Show sidebar on desktop
    }

    if (!this.comments || this.comments[0]?.topic_id !== this.currentTopic?.id) {
      this.blockedUIComment = true;
      const getCommentsSub$ = this.topicCommentService.getComments(this.currentTopic!.id).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (res.status === 200) {
              this.comments = res.data;
              this.blockedUIComment = false;
            } else {
              this.blockedUIComment = false;
            }
          });
        },
        error: (error) => {
          console.error('Error getting comments:', error);
          this.blockedUIComment = false;
        },
      });
      this.subscriptions.push(getCommentsSub$); 
    }
  }

  onDialogClose(): void {
    this.displayDialog = false;
  }

  scrollToTarget() {
    const targetElement = document.getElementById('targetDiv');

    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200; // Adjust this value as necessary

      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
