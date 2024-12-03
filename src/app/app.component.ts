import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { isPlatformBrowser } from '@angular/common';
import { User } from './common/models';
import { SocketService } from './common/services/socket.service';
import { DevtoolsLoggingService } from './common/services/devtools-logging.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Unicourse-Client';
  user: User | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private socketService: SocketService,
    private devtoolsLoggingService: DevtoolsLoggingService,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize devtools detection
      this.devtoolsLoggingService.initDevtoolsDetection();

      // Check if user is already logged
      const userLocal: User | undefined = localStorage.getItem('UserInfo') ? JSON.parse(localStorage.getItem('UserInfo') as string) : undefined;
      if (userLocal) {
        this.socketService.connect('/');
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }

  private cleanupResources(): void {
    this.socketService.disconnect();
  }
}
