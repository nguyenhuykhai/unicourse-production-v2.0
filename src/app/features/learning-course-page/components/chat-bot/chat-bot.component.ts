import { Component, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Subscription } from 'rxjs';
import { ChatBoxService } from './core/services';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SharedModule } from '../../../../shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [SharedModule, MarkdownModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.scss',
})
export class ChatBotComponent implements OnDestroy {
  questionText: string = '';
  displayText: string = '';
  currentIndex: number = 0;
  i = 0;
  speed = 10;
  loading = false;
  public LOGO = environment.LOGO;

  private timeoutId: any;
  private subscriptions: Subscription[] = [];

  constructor(private chatbotService: ChatBoxService) {}

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // LOGIC ZONE
  askQuestion(): void {
    if (this.questionText.trim() === '' || this.loading) {
      return;
    }

    this.displayText = 'Trợ lý Unicourse đang tìm câu trả lời...';
    this.loading = true;
    const sendMessageSub$ = this.chatbotService.generateChatBot(this.questionText).subscribe({
      next: (response) => {
        this.displayText = '';
        this.typeWriter(response.data.response.text);
        this.loading = false;
      },
      error: (error) => {
        this.displayText = 'Xin lỗi, trợ lý Unicourse không thể trả lời câu hỏi của bạn.';
        this.loading = false;
      },
    });
    this.subscriptions.push(sendMessageSub$);
  }

  // BEHAVIOR ZONE
  toggleOverlay(op: OverlayPanel, event: MouseEvent) {
    op.toggle(event);
    this.displayText = '';
    this.questionText = '';
  }

  // Some event or function to trigger typing animation
  typeWriter(message: string) {
    if (this.i < message.length) {
      this.displayText += message.charAt(this.i);
      this.i++;
      this.timeoutId = setTimeout(() => {
        this.typeWriter(message);
      }, this.speed);
    } else {
      this.i = 0;
      clearTimeout(this.timeoutId);
    }
  }

  // Clear chatbot message
  clearForm() {
    this.loading = false;
    this.displayText = '';
    this.questionText = '';
    this.i = 0;
    clearTimeout(this.timeoutId);
  }
}
