import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subscription } from 'rxjs';
import { SharedModule } from '../../../shared.module';
import { SharedService } from '../../../../common/services';
import { AuthService } from './core/services';
import { LOGO } from '../../../../../assets';
import { Response, User } from '../../../../common/models';
import { FormControl, FormGroup } from '@angular/forms';
import { Account } from './core/models';
import { ErrorHandlingService } from '../../../../common/services/error-handling.service';

@Component({
  selector: 'app-sign-in-form-dialog',
  standalone: true,
  imports: [RouterModule, CommonModule, SharedModule],
  providers: [AuthService],
  templateUrl: './sign-in-form-dialog.component.html',
  styleUrls: ['./sign-in-form-dialog.component.scss'],
})
export class SignInFormDialogComponent implements OnInit, OnDestroy {
  public visibleSignInDialog: boolean = false;
  public LOGO = LOGO;
  private subscriptions: Subscription[] = [];
  helper = new JwtHelperService();
  user!: User;

  // Behaviors variable
  account: Account = {} as Account;
  mode: string = 'DEFAULT_LOGIN_MODE'; // DEFAULT_LOGIN_MODE | FORGOT_PASSWORD_MODE | FORM_SIGN_IN_MODE | FORM_SIGN_UP_MODE

  constructor(
    private readonly sharedService: SharedService,
    private readonly errorHandlingService: ErrorHandlingService,
    public authService: AuthService,
    public afAuth: AngularFireAuth,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const turnOnSignInSub = this.sharedService.turnOnSignIn$.subscribe({
      next: (res: boolean) => {
        if (res) {
          this.showSignInDialog();
        }
      },
    });

    const turnOffSignInSub = this.sharedService.turnOffSignIn$.subscribe({
      next: (res: boolean) => {
        if (res) {
          this.hideSignInDialog();
        }
      },
    });

    this.subscriptions.push(turnOnSignInSub, turnOffSignInSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  showSignInDialog(): void {
    this.visibleSignInDialog = true;
  }

  hideSignInDialog(): void {
    this.visibleSignInDialog = false;
  }

  tryGoogleLogin(): void {
    this.authService.doGoogleLogin().then(() => {
      this.getCurrentUser()
        .then((userInfo) => {
          if (userInfo) {
            const userSub$ = this.authService.signIn(userInfo.accessToken).subscribe({
              next: (res: Response<any>) => {
                if (res.status === 200 || res.status === 201) {
                  const accessToken = res && res.data.accessToken.split(' ')[1];
                  const refreshToken = res && res.data.refreshToken.split(' ')[1];
                  const wishlist: Array<{ id: string; course_mentor_id: string }> = [];
                  const decoded = this.helper.decodeToken(accessToken);
                  this.user = decoded;
                  localStorage.setItem('accessToken', accessToken);
                  localStorage.setItem('refreshToken', refreshToken);
                  localStorage.setItem('isLogin', 'true');
                  localStorage.setItem('UserInfo', JSON.stringify(this.user));
                  this.user?.student?.wishlist !== undefined &&
                    this.user?.student.wishlist.map((item: any) => {
                      wishlist.push({
                        id: item.id,
                        course_mentor_id: item.course_mentor_id,
                      });
                    });
                  localStorage.setItem('wishlist', JSON.stringify(wishlist));
                  this.sharedService.settingLocalStorage();
                  this.hideSignInDialog();
                  window.location.reload();
                }
              },
              error: (err) => {
                this.errorHandlingService.logError(err.status, err.message);
              },
            });
            this.subscriptions.push(userSub$);
          }
        })
        .catch((error) => {
          this.errorHandlingService.logError(error.status, error.message || 'Error retrieving user information');
        });
    });
  }


  trySignIn(): void {
    if (
      this.account.password_error ||
      this.account.username_error ||
      !this.account.username ||
      !this.account.password
    ) {
      return;
    }

    // Handle additional user info processing
    const userSub$ = this.authService
      .login(this.account.username, this.account.password)
      .subscribe({
        next: (res: Response<any>) => {
          if (res.status === 200 || res.status === 201) {
            const accessToken = res && res.data.accessToken.split(' ')[1];
            const refreshToken = res && res.data.refreshToken.split(' ')[1];
            const wishlist: Array<{
              id: string;
              course_mentor_id: string;
            }> = [];
            // Decode the token
            const decoded = this.helper.decodeToken(accessToken);
            this.user = decoded;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('isLogin', 'true');
            localStorage.setItem('UserInfo', JSON.stringify(this.user));
            this.user?.student?.wishlist !== undefined &&
              this.user?.student.wishlist.map((item: any) => {
                wishlist.push({
                  id: item.id,
                  course_mentor_id: item.course_mentor_id,
                });
              });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            this.sharedService.settingLocalStorage();
            this.hideSignInDialog();
            window.location.reload();
          }
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.account.password_error = 'Tài khoản hoặc mật khẩu không đúng';
          });
        },
      });
    this.subscriptions.push(userSub$);
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.onAuthStateChanged((user: any) => {
        if (user) {
          const userInfo = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            accessToken: user._delegate.accessToken,
          };
          resolve(userInfo);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  // LOGIC ZONE
  isFieldInvalid(value: string, type: string): boolean {
    switch (type) {
      case 'USERNAME':
        if (!value || value.trim() === '') {
          this.ngZone.run(() => {
            this.account.username_error = 'Trường này không được để trống';
          });
          return true;
        }
        if (value.length > 30) {
          this.ngZone.run(() => {
            this.account.username_error = 'Tài khoản không được quá 30 ký tự';
          });
          return true;
        }
        this.account.username_error = undefined;
        return false;
      case 'PASSWORD':
        if (!value || value.trim() === '') {
          this.ngZone.run(() => {
            this.account.password_error = 'Trường này không được để trống';
          });
          return true;
        }
        if (value.length < 6) {
          this.ngZone.run(() => {
            this.account.password_error = 'Mật khẩu phải có ít nhất 6 ký tự';
          });
          return true;
        }
        this.account.password_error = undefined;
        return false;
      default:
        return !value || value.trim() === '';
    }
  }

  // BEHAVIOR ZONE
  changeMode(type: string) {
    this.account.password_error = undefined;
    this.account.username_error = undefined;
    this.account.username = '';
    this.account.password = '';
    this.mode = type;
  }
}
