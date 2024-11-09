import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PSidebarComponent } from './p-sidebar/p-sidebar/p-sidebar.component';
import { Sidebar } from 'primeng/sidebar';
import { Chapter, Topic } from '../../../../common/models';
import { DialogBroadcastService } from '../../../../common/services';

@Component({
  selector: 'app-learning-course-footer',
  standalone: true,
  imports: [SharedModule, PSidebarComponent],
  templateUrl: './learning-course-footer.component.html',
  styleUrls: ['./learning-course-footer.component.scss'],
})
export class LearningCourseFooterComponent {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  @Output() moveLesson = new EventEmitter<Topic>();
  @Output() moveNextOrPrevLesson = new EventEmitter<string>();
  @Input() chapters: Array<Chapter> | undefined;
  @Input() blocked: boolean | undefined;
  @Input() currentTopic: Topic | undefined;
  @Input() currentChapterId: string | undefined;

  sidebarVisible = false;
  previousLesson: Topic | undefined;
  nextLesson: Topic | undefined;

  constructor(
    private dialogBroadcastService: DialogBroadcastService
  ) {}

  handleMoveLesson(lesson: Topic) {
    this.moveLesson.emit(lesson);
  }

  handleMoveNextOrPrevLesson(enumType: string) {
    this.moveNextOrPrevLesson.emit(enumType);
  }

  toggleSidebar(e: any): void {
    if (this.blocked) {
      return;
    }
    this.sidebarVisible = !this.sidebarVisible;
  }
}
