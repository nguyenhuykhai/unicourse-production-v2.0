import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedModule } from '../../../../shared/shared.module';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Blog } from '../../../../common/models';

@Component({
  selector: 'app-blog-content',
  standalone: true,
  imports: [SharedModule, EditorModule],
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.scss']
})
export class BlogContentComponent implements OnInit, OnDestroy {
  @Input() blog: Blog | undefined;
  @Input() blockedUI: boolean | undefined;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  // Sanitize content and process images
  sanitizeContent(content: any): any {
    if (!content) {
      return '';
    }

    // Adjust width and height attributes in img tags
    const modifiedContent = this.adjustImageAttributes(content);
    return this.sanitizer.bypassSecurityTrustHtml(modifiedContent);
  }

  // Adjust width and height attributes in the content
  adjustImageAttributes(content: string): string {
    return content.replace(/<img[^>]+>/g, (imgTag) => {
      // Remove width and height attributes
      imgTag = imgTag.replace(/width="[^"]*"/g, '');
      imgTag = imgTag.replace(/height="[^"]*"/g, '');
      // Add or update style attribute
      if (imgTag.includes('style="')) {
        imgTag = imgTag.replace(/style="([^"]*)"/, 'style="$1;max-width:100%;height:auto;"');
      } else {
        imgTag = imgTag.replace(/<img/, '<img style="max-width:100%;height:auto;"');
      }
      return imgTag;
    });
  }
}