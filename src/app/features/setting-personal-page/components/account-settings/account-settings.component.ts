import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { SETTING } from '../../constants';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']  // Changed from styleUrl to styleUrls
})
export class AccountSettingsComponent {
  @Output() changeTab = new EventEmitter<string>();
  currentTab: string = 'personal-info';

  handleChangeTab(tab: string) {
    this.currentTab = tab;
    this.changeTab.emit(tab);
  }

  isActive(tab: string): boolean {
    return this.currentTab === tab;
  }
}