import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  OnChanges,
  OnInit,
  OnDestroy,
  NgZone,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { ScrollTop } from 'primeng/scrolltop';
import { Chapter, EMBED_YOUTUBE, GET_SOURCE_VIDEO, Platform, Topic, Video } from '../../../../common/models';
import { SharedModule } from '../../../../shared/shared.module';
import { QuestionService } from './core/services';
import { QuestionBank, TabActive } from './core/models';
import { QuestionBankComponent } from './components/question-bank/question-bank.component';
import { VideoComponent } from "./components/video/video.component";
import { VideoService } from '../../../../common/services';
import { DocumentComponent } from "./components/document/document.component";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
  }
}

@Component({
  selector: 'app-learning-course-content',
  standalone: true,
  imports: [SharedModule, QuestionBankComponent, VideoComponent, DocumentComponent],
  templateUrl: './learning-course-content.component.html',
  styleUrls: ['./learning-course-content.component.scss'],
})
export class LearningCourseContentComponent
  implements OnInit, OnChanges, OnDestroy
{
  @ViewChild('videoPlayer') videoPlayer:
    | ElementRef<HTMLVideoElement>
    | undefined;
  @Output() questionStateChange = new EventEmitter<string>();
  @Input() data: Video | undefined;
  @Input() courseMentorId: string | undefined;
  @Input() currentChapterId: string | undefined;
  @Input() currentTopicId: string | undefined;
  @Input() chapters: Array<Chapter> | undefined;
  @Input() blocked: boolean | undefined;
  tabActiveIndex: string = TabActive.CONTENT;
  currentTopic: Topic | undefined;
  videoData: Array<Video> = [];
  videoUrl: any;
  questionBank: Array<QuestionBank> | undefined;
  
  private subscriptions: Subscription[] = [];
  private youTubePlayer: any;

  constructor(
    private router: Router,
    private readonly questionService: QuestionService,
    private readonly videoService: VideoService,
    private sanitizer: DomSanitizer,
    private scroller: ViewportScroller,
    private ngZone: NgZone // Helps Angular recognize external data changes
  ) {}

  ngOnInit(): void {
    this.scrollToTop();
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['currentChapterId'] ||
      changes['currentTopicId'] ||
      changes['chapters']
    ) {
      if (
        !changes['data']?.isFirstChange() ||
        !changes['currentChapterId']?.isFirstChange() ||
        !changes['currentTopicId']?.isFirstChange() ||
        !changes['chapters']?.isFirstChange()
      ) {
        this.ngZone.run(() => {
          this.tabActiveIndex = TabActive.CONTENT;
          this.initData();
        }); // Run the change detection in the Angular zone
      }
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // INITIALIZATION ZONE
  initData(): void {
    this.ngZone.run(() => {
      if (!this.chapters || !this.currentChapterId || !this.currentTopicId) {
        return;
      }
  
      this.currentTopic = this.chapters
        .find((chapter) => chapter.id === this.currentChapterId)
        ?.topic.find((topic) => topic.id === this.currentTopicId);

      // Check if the current topic has a question bank, then call api to get the question bank
      if (this.currentTopic?.element_topic?.question_bank) {
        const questionBankSubscription$ = this.questionService.getQuestionBankById(this.currentTopic?.element_topic?.question_bank.id).subscribe({
          next: (res) => {
            this.ngZone.run(() => {
              if (res.status === 200) {
                this.videoUrl = undefined;
                this.questionBank = res.data
              } else {
                this.videoUrl = undefined;
                this.questionBank === undefined
              }
            });
          },
          error: (error) => {
            this.ngZone.run(() => {
              console.error(error);
              this.videoUrl = undefined;
              this.questionBank === undefined
            });
          },
        });
        this.subscriptions.push(questionBankSubscription$);
      }
  
      if (!this.data) {
        this.videoUrl = undefined;
        return;
      }

      if (this.videoData.length > 0 && this.data) {
        const videoData = this.videoData.find((item) => item.id === this.data?.id);
        if (videoData) {
          this.videoUrl = videoData.videoUrl;
          return;
        }
      }
  
      switch (this.data.platform?.toLowerCase()) {
        case Platform.YOUTUBE:
          this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `${EMBED_YOUTUBE}${this.data.url}`
          );
          this.storageVideoData(this.data, this.videoUrl);
          break;
        case Platform.VIMEO:
          if (this.courseMentorId) {
            const getVimeoVideoSub$ = this.videoService.getVimeoVideoWithAccessToken(this.courseMentorId, this.data.url, 1460, 586).subscribe({
              next: (response) => {
                const url = response.data.html.match(GET_SOURCE_VIDEO);
                if (url && this.data) {
                  this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url[1]);
                  this.storageVideoData(this.data, this.videoUrl);
                }
              },
              error: (error) => {
                console.error('Error: ', error);
              },
              complete: () => {
                getVimeoVideoSub$.unsubscribe();
              },
            });
            this.subscriptions.push(getVimeoVideoSub$);
          }

          break;
        default:
          this.videoUrl = undefined;
          break;
      }
    });
  }

  // LOGIC ZONE
  handleEmitQuestionStateChange(event: string): void {
    this.questionStateChange.emit(event);
  }

  storageVideoData(video: Video, videoUrl: any): void {
    this.videoData.push({
      id: video.id,
      url: video.url,
      duration: video.duration,
      platform: video.platform,
      videoUrl: videoUrl,
      created_at: video.created_at,
      updated_at: video.updated_at
    });
  }

  // BEHAVIOR ZONE
  changeTabActive(event: string): void {
    this.tabActiveIndex = event;
  }

  convertDateTimeToText(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('vi-VN');
  }

  scrollToTop(): void {
    this.scroller.scrollToPosition([0, 0]);
  }
}
