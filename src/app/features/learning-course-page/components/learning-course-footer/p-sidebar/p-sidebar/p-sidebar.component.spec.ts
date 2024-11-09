import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PSidebarComponent } from './p-sidebar.component';

describe('PSidebarComponent', () => {
  let component: PSidebarComponent;
  let fixture: ComponentFixture<PSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
