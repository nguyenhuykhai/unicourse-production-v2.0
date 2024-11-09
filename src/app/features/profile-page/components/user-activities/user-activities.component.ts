import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-activities.component.html',
  styleUrl: './user-activities.component.scss'
})
export class UserActivitiesComponent {
  // @Input() activities!: string;
}
