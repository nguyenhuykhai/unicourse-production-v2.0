import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { isPlatformBrowser } from '@angular/common';
import { User } from './common/models';
import { SocketService } from './common/services/socket.service';
import { DevtoolsService } from './common/services/devtools.service';

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
    private devtoolsService: DevtoolsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize devtools detection
      this.devtoolsService.initDevtoolsDetection();

      // Check if user is already logged
      const userLocal: User | undefined = localStorage.getItem('UserInfo') ? JSON.parse(localStorage.getItem('UserInfo') as string) : undefined;
      const accessToken: string | null | undefined = localStorage.getItem('accessToken') ? localStorage.getItem('accessToken') : undefined;
      if (userLocal && accessToken) {
        this.connectSocket(accessToken);
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupResources();
  }

  private connectSocket(token: string): void {
    this.socketService.connectWithToken(token, '/')
  }

  private cleanupResources(): void {
    this.socketService.disconnect();
  }
}
