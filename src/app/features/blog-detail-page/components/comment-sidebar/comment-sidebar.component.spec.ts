import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentSidebarComponent } from './comment-sidebar.component';

describe('CommentSidebarComponent', () => {
  let component: CommentSidebarComponent;
  let fixture: ComponentFixture<CommentSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
