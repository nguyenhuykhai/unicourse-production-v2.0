import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Banner } from '../../core/models';

@Component({
  selector: 'app-carousel-banner',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './carousel-banner.component.html',
  styleUrl: './carousel-banner.component.scss',
  host: { ngSkipHydration: 'true' },
})
export class CarouselBannerComponent {
  @Input() public banners: Banner[] = [];

  ngOnInit() {}

  openLink(link: string): void {
    window.open(`${link}`, '_blank');
  }
}
