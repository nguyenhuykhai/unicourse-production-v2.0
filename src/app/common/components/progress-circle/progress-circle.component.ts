import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-progress-circle',
  standalone: true,
  imports: [],
  templateUrl: './progress-circle.component.html',
  styleUrl: './progress-circle.component.scss',
})
export class ProgressCircleComponent implements OnChanges {
  @Input() value: number = 0; // Progress value (0 to 100)
  @Input() radius: number = 50; // Default radius of the circle
  @Input() strokeWidth: number = 10; // Default stroke width of the circle
  @Input() color: string = '#4CAF50'; // Default color (green)

  circumference!: number;
  dashoffset!: number;

  ngOnChanges(changes: SimpleChanges): void {
    this.circumference = 2 * Math.PI * (this.radius - this.strokeWidth / 2);
    this.updateProgress(this.value);
    this.value = Math.round(this.value);
  }

  private updateProgress(value: number): void {
    const progress = value / 100;
    this.dashoffset = this.circumference * (1 - progress);
  }
}
