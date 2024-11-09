import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Topic } from '../../../../../../common/models';
import { SharedModule } from '../../../../../../shared/shared.module';
import { MenuItem } from 'primeng/api';
import { ChatBotComponent } from '../../../chat-bot/chat-bot.component';
import { TabActive } from '../../core/models';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [SharedModule, ChatBotComponent],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss',
})
export class VideoComponent implements OnInit {
  @Input() videoUrl: any;
  @Input() currentTopic: Topic | undefined;
  @Output() tabActive = new EventEmitter<string>();
  items: MenuItem[] | undefined;
  tabActiveIndex: string = TabActive.CONTENT;

  ngOnInit() {
    this.items = [
      {
        label: 'Nội dung bài học',
        icon: 'pi pi-book',
        command: () => {
          this.tabActiveIndex = TabActive.CONTENT;
          this.tabActive.emit(TabActive.CONTENT);
        },
      },
      {
        label: 'Trợ lý Unicourse',
        icon: 'pi pi-question-circle',
        command: () => {
          this.tabActiveIndex = TabActive.CHATBOT;
          this.tabActive.emit(TabActive.CHATBOT);
        },
      },
    ];
  }

  // BEHAVIOR ZONE
  convertDateTimeToText(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
