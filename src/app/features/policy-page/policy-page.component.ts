import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './policy-vi-page.component.html',
  styleUrl: './policy-page.component.scss',
})
export class PolicyPageComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    // Use AfterViewInit to ensure DOM is fully loaded
    if (isPlatformBrowser(this.platformId)) {
      this.scrollToTarget();
    }
  }

  scrollToTarget() {
    const targetElement = document.getElementById('targetDiv');

    if (targetElement) {
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const offset = 200; // Adjust this value as necessary

      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
