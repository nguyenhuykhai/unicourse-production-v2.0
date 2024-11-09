import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { LOGO_FOOTER } from '../../../../assets';
import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';
import { DialogBroadcastService } from '../../../common/services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterComponent implements OnInit {
  public LOGO_FOOTER = LOGO_FOOTER;

  constructor(
    private readonly dialogBroadcastService: DialogBroadcastService
  ) {}

  ngOnInit() {
    // Kiểm tra xem window và customElements có tồn tại hay không
    if (typeof window !== 'undefined' && 'customElements' in window) {
      // Định nghĩa custom element cho lord-icon
      defineElement(lottie.loadAnimation);
    } else {
      console.warn('Custom Elements are not supported in this environment.');
    }
  }

  openLink(link: string): void {
    window.open(`${link}`, '_blank');
  }

  showDialog(): void {
    this.dialogBroadcastService.broadcastConfirmationDialog({
      header: 'Thông báo',
      message: 'Ứng dụng mobile dành cho Android đang trong quá trình phát triển. Vui lòng quay lại sau.',
      type: 'info',
      return: false,
      numberBtn: 1,
    });
  }
}
