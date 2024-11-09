import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared.module';
import { Course, PayloadData } from '../../../../common/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.scss'
})
export class SearchDialogComponent {
  @Input() dataSearch: PayloadData<Course> | undefined;
  @Input() searchText: string | undefined;
  @Input() loadingSearch: boolean | undefined;
  @Output() toggleSearch = new EventEmitter<boolean>();

  constructor(
    private router: Router
  ) {}

  // BEHAVIOR ZONE
  redirectToCourseDetail(data: Course) {
    this.router.navigate([`/courses/${data.id}`]);
    this.toggleSearch.emit(false);
  }
}
