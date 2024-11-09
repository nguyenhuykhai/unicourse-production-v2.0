import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
@Component({
  selector: 'app-about-us-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './about-us-page.component.html',
  styleUrl: './about-us-page.component.scss',
})
export class AboutUsPageComponent {}
