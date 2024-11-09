import { ApplicationRef, Component, Input, NgZone, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Chapter, Course, EMBED_YOUTUBE, GET_SOURCE_VIDEO, Platform, Topic, Video } from '../../../../common/models';
import { first, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { VideoService } from '../../../../common/services';

declare interface ChapterObject {
  chapters: Array<Chapter>;
  totalElement: number;
  totalLesson: number;
  totalMinute: number;
}

@Component({
  selector: 'app-course-main-content',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-main-content.component.html',
  styleUrl: './course-main-content.component.scss',
})
export class CourseMainContentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() course: Course | undefined;
  @Input() blockedUI: boolean | undefined;

  platform: string = Platform.YOUTUBE;
  videoData: Array<Video> = [];
  public visible: boolean = false;
  public videoUrl: any = '';
  chapterObject: ChapterObject = {
    chapters: [],
    totalElement: 0,
    totalLesson: 0,
    totalMinute: 0,
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly videoService: VideoService,
    private applicationRef: ApplicationRef,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
      this.initData();
  }

  ngOnChanges() {
    this.initData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  scrollToTarget() {
    const targetElement = document.getElementById('targetDiv');

    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }

  initData() {
    if (!this.course) {
      return;
    }
    
    let totalLesson: number = 0;
    let totalMinute: number = 0;
    this.chapterObject.chapters = this.course.chapter.sort((a, b) => a.position - b.position);
    this.chapterObject.totalElement = this.course.chapter.length;
    this.course.chapter.map(item => {
      totalLesson += item.topic.length
      item.topic.map((topic) => (topic.element_topic?.video) ? (totalMinute += topic.element_topic.video?.duration) : (totalMinute += 0))
    });
    this.chapterObject.totalLesson = totalLesson;
    this.chapterObject.totalMinute = totalMinute;
  }

  convertNumberToTime(number: any): string {
    if (typeof number !== 'number') {
      return '';
    }
    
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return `${hours} giờ ${minutes} phút`;
  }

  countDurationOfTopic(topic: Array<Topic>): string {
    let totalDuration = 0;
    topic.map((element: Topic) => {
      if (element.element_topic?.video) {
        totalDuration += element.element_topic.video.duration || 0;
      }
      if (element.element_topic?.question_bank) {
        totalDuration += element.element_topic.question_bank.duration || 0;
      }
      if (element.element_topic?.document) {}
    });
    return this.convertNumberToTime(totalDuration);
  }

  showDialog(video: Video | undefined) {
    if (!video) {
      return;
    }

    if (this.videoData.length > 0) {
      const videoData = this.videoData.find((item) => item.id === video.id);
      if (videoData) {
        this.videoUrl = videoData.videoUrl;
        this.platform = videoData.platform;
        this.visible = true;
        return;
      }
    }

    switch (video.platform.toLowerCase()) {
      case Platform.YOUTUBE:
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `${EMBED_YOUTUBE}${video.url}`
        );
        this.videoData.push({
          id: video.id,
          url: video.url,
          duration: video.duration,
          platform: video.platform,
          videoUrl: this.videoUrl,
          created_at: video.created_at,
          updated_at: video.updated_at
        })
        this.platform = Platform.YOUTUBE;
        this.visible = true;
        break;
      case Platform.VIMEO:
        const getVimeoVideoSub$ = this.videoService.getVimeoVideoPreview(video.url, 1460, 586).subscribe({
          next: (response) => {
            this.ngZone.run(() => {
              const url = response.data.html.match(GET_SOURCE_VIDEO);
              if (url) {
                this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url[1]);
                this.videoData.push({
                  id: video.id,
                  url: video.url,
                  duration: video.duration,
                  platform: video.platform,
                  videoUrl: this.videoUrl,
                  created_at: video.created_at,
                  updated_at: video.updated_at
                });
              }
              this.platform = Platform.VIMEO;
              this.applicationRef.tick();
              this.visible = true;
            });
          },
          error: (error) => {
            console.error('Error: ', error);
          },
          complete: () => {
            getVimeoVideoSub$.unsubscribe();
          },
        });
        this.subscriptions.push(getVimeoVideoSub$);
        break;
      default:
        break;
    }
  }
}