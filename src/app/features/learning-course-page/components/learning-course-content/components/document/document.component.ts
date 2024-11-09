import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../../../shared/shared.module';
import { DomSanitizer } from '@angular/platform-browser';
import { Topic } from '../../../../../../common/models';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss',
})
export class DocumentComponent implements OnChanges {
  @Input() currentTopic: Topic | undefined;
  @Input() tabActiveIndex: string | undefined;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTopic']) {
      this.currentTopic = changes['currentTopic'].currentValue;
    }
  }

  // BEHAVIOR ZONE
  convertDateTimeToText(date: Date | undefined): string {
    if (!date) {
      return '';
    }
    return new Date(date).toLocaleDateString('vi-VN');
  }

  // Sanitize content
  sanitizeContent(content: any): any {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
