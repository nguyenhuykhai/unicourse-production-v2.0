import { Component, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from '../../../../common/models';
import { DialogBroadcastService } from '../../../../common/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnDestroy {
  display!: boolean;
  message!: string;
  header!: string;
  icon!: string;
  type!: string;
  return!: boolean;
  numberBtn!: number;
  callback?: (...args: any[]) => void; // Dynamic callback function
  args?: any[]; // Arguments for the callback
  private confirmSubscription: Subscription | undefined;

  constructor(
    public dialogBroadcastService: DialogBroadcastService,
    public confirmationService: ConfirmationService,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.confirmSubscription = this.dialogBroadcastService.getConfirmationDialog().subscribe((dialog) => {
      this.confirm(dialog);
    });
  }

  confirm(dialog: ConfirmDialog) {
    this.header = dialog.header || 'Thông báo';
    this.message = dialog.message || 'Bạn có chắc chắn muốn tiếp tục không?';
    this.type = dialog.type || 'info';
    this.return = dialog.return || true;
    this.numberBtn = dialog.numberBtn || 2;
    this.callback = dialog.callback; // Set the dynamic callback function
    this.args = dialog.args || []; // Set the arguments for the callback
    this.display = true;
  }

  handleConfirmBtn(action: boolean) {
    if (this.return) {
      this.dialogBroadcastService.confirmDialog(action);
    }

    // Execute the dynamic callback function with arguments if it's provided
    if (this.callback) {
      this.callback(action, ...(this.args || [])); // Pass `action` and any additional arguments
    }

    this.display = false; // Close the dialog
  }

  ngOnDestroy(): void {
    if (this.confirmSubscription) {
      this.confirmSubscription.unsubscribe();
    }
  }
}