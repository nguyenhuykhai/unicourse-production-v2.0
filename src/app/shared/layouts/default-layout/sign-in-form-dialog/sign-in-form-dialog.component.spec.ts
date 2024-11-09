import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInFormDialogComponent } from './sign-in-form-dialog.component';

describe('SignInFormDialogComponent', () => {
  let component: SignInFormDialogComponent;
  let fixture: ComponentFixture<SignInFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
