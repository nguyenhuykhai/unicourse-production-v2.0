import { ApplicationRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { first } from 'rxjs';
import { Course } from '../../../../common/models';

@Component({
  selector: 'app-course-description',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './course-description.component.html',
  styleUrl: './course-description.component.scss',
})
export class CourseDescriptionComponent implements OnInit, OnChanges {
  @Input() course: Course | undefined;
  @Input() blockedUI: boolean | undefined;
  public safeHtml!: SafeHtml;
  public isExpanded: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private applicationRef: ApplicationRef
  ) {}

  ngOnInit() {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.course?.description || '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && changes['course'].currentValue) {
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.course?.description || '');
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
