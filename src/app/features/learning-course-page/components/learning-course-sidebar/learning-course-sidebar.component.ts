import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Chapter, Topic } from '../../../../common/models';
import { LearningChapter, LearningTopic } from './core/models';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-learning-course-sidebar',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './learning-course-sidebar.component.html',
  styleUrls: ['./learning-course-sidebar.component.scss'], // Corrected to styleUrls
})
export class LearningCourseSidebarComponent implements OnInit, OnChanges {
  @Output() moveLesson = new EventEmitter<Topic>();
  @Input() chapters: Array<Chapter> | undefined;
  @Input() blocked: boolean | undefined;
  @Input() currentTopic: Topic | undefined;
  learningChapter: Array<Chapter> = [];

  constructor() {}

  ngOnInit(): void {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['learningChapter'] ||
      changes['chapters'] ||
      changes['blocked'] ||
      changes['currentTopic']
    ) {
      if (
        !changes['learningChapter']?.isFirstChange() ||
        !changes['chapters']?.isFirstChange() ||
        !changes['blocked']?.isFirstChange() ||
        !changes['currentTopic']?.isFirstChange()
      ) {
        this.initData();
      }
    }
  }

  initData(): void {
    if (this.chapters) {
      this.learningChapter = cloneDeep(this.chapters);
    }
  }

  toggleSession(session: Chapter): void {
    session.expanded = !session.expanded;
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
}
