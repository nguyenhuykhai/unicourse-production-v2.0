import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  NgZone,
  AfterViewInit
} from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { Chapter, Topic } from '../../../../../../common/models';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-p-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './p-sidebar.component.html',
  styleUrls: ['./p-sidebar.component.scss'], // Corrected to styleUrls
})
export class PSidebarComponent implements OnInit, OnChanges, AfterViewInit {
  @Output() moveLesson = new EventEmitter<Topic>();
  @Input() chapters: Array<Chapter> | undefined;
  @Input() blocked: boolean | undefined;
  @Input() sidebarVisible!: boolean;
  @Input() currentChapterId: string | undefined;
  @Input() currentTopic: Topic | undefined;
  learningChapter: Array<Chapter> = [];

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['learningChapter'] ||
      changes['chapters'] ||
      changes['blocked'] ||
      changes['currentChapterId'] ||
      changes['currentTopic'] ||
      changes['sidebarVisible']
    ) {
      if (
        !changes['learningChapter']?.isFirstChange() ||
        !changes['chapters']?.isFirstChange() ||
        !changes['blocked']?.isFirstChange() ||
        !changes['currentChapterId']?.isFirstChange() ||
        !changes['currentTopic']?.isFirstChange()
      ) {
        this.initData();
      }
    }
  }

  ngAfterViewInit(): void {
    // Use AfterViewInit to ensure DOM is fully loaded
    this.scrollToTarget(this.currentTopic?.id);
  }

  initData(): void {
    if (this.chapters) {
      this.learningChapter = cloneDeep(this.chapters);
      this.scrollToTarget(this.currentTopic?.id);
    }
  }

  handleMoveLesson(lesson: Topic) {
    this.moveLesson.emit(lesson);
  }

  convertDurationToText(duration: number | undefined): string {
    if (!duration) {
      return '';
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours} giờ ${minutes} phút`;
  }

  toggleSession(session: any) {
    session.expanded = !session.expanded;
  }

  scrollToTarget(lessonId: string | undefined): void {
    if (!lessonId) {
      return;
    }

    // Use NgZone to ensure the DOM update is detected properly
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const targetElement = document.getElementById(`lesson-${lessonId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0); // Timeout ensures DOM is fully rendered before scrolling
    });
  }
}