import {
  Component,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { LOGO } from '../../../../../assets';
import { SharedModule } from '../../../../shared/shared.module';
import { LearningProgress } from '../../core/models';
import {
  CircleProgressComponent,
  CircleProgressOptions,
} from 'ng-circle-progress';
import { ProgressCircleComponent } from '../../../../common/components/progress-circle/progress-circle.component';

@Component({
  selector: 'app-learning-course-header',
  standalone: true,
  imports: [SharedModule, ProgressCircleComponent],
  templateUrl: './learning-course-header.component.html',
  styleUrl: './learning-course-header.component.scss',
})
export class LearningCourseHeaderComponent implements OnChanges {
  public LOGO = LOGO;

  @Input() header: string | undefined;
  @Input() blocked: boolean | undefined;
  @Input() learningProgress: LearningProgress | undefined;

  progress = 0;

  @ViewChild('circleProgressComponent')
  circleProgressComponent!: CircleProgressComponent;

  constructor(
    private ngZone: NgZone,
    
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['learningProgress'] && this.learningProgress) {
      if (
        this.learningProgress?.totalTopic &&
        this.learningProgress?.totalCompletedTopic
      ) {
        this.updateProgress(
          this.learningProgress.totalTopic,
          this.learningProgress.totalCompletedTopic
        );
      }
    }
  }

  updateProgress(
    totalTopic: number | undefined,
    totalCompletedTopic: number | undefined
  ): number {
    this.ngZone.run(() => {
      this.progress = ((totalTopic ?? 0) / (totalCompletedTopic ?? 1)) * 100;
    });
    return this.progress ?? 0;
  }
}
