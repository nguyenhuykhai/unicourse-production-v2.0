import { Component, Input, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student, User } from '../../../../common/models';

enum InstanceType {
  STUDENT,
  USER,
  UNDEFINED,
}

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnChanges {
  @Input() student: Student | undefined;
  @Input() user: User | undefined;

  instanceType: InstanceType = InstanceType.UNDEFINED;

  constructor(
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student']) {
      this.ngZone.run(() => {
        this.instanceType = InstanceType.STUDENT;
      });
    }
    if (changes['user']) {
      this.ngZone.run(() => {
        this.instanceType = InstanceType.USER;
      });
    }
  }

  convertRoleToString(role: string | undefined): string {
    switch (role) {
      case 'STUDENT':
        return 'Học viên';
      case 'LECTURER':
        return 'Giảng viên';
      case 'MENTOR':
        return 'Mentor';
      case 'ADMIN':
        return 'Quản trị viên';
      default:
        return 'Thành viên';
    }
  }
}
