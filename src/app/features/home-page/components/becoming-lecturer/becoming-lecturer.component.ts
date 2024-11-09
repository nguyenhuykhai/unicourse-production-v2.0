import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-becoming-lecturer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './becoming-lecturer.component.html',
  styleUrl: './becoming-lecturer.component.scss',
})
export class BecomingLecturerComponent {}
