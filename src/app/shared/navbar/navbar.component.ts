import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from '../../user/user-add-edit/user-add-edit.component';
import { UserModel } from '../../models/user.model';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SessionService } from '../../services/session.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../services/cart.service';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NotificationsComponent } from '../notifications/notifications.component';
import { UserService } from '../../services/user.service';
import { AlertService } from '../alert/alert.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, UserAddEditComponent, CommonModule, FormsModule, NotificationsComponent, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isRegister: boolean = false;
  showNavbar: boolean = true;
  isAdmin: boolean = false;
  loggedIn: boolean = false;
  showNotifications: boolean = false;

  @Input() showModal: boolean = false;
  @ViewChild('notificationBtn') notificationBtn!: ElementRef;

  cartCount: number = 0;
  unreadCount: number = 0;

  user: UserModel = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    pinCode: '',
    profileImage: '',
    password: '',
    address: '',
    userImage: '',
    role: ''
  };
  searchText: string = '';

  private refreshInterval: any;

  constructor(private CommunicationService: ComponentCommunicationService,
    private sessionService: SessionService,
    private cartService: CartService,
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthenticationService,
    private userService: UserService, private alertService: AlertService) {
    this.CommunicationService.isLoggedIn$.subscribe(val => this.loggedIn = val);
    this.CommunicationService.isAdmin$.subscribe(val => this.isAdmin = val);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedOnButton = this.notificationBtn?.nativeElement.contains(target);
    const notificationDropdown = document.querySelector('.notifications-dropdown');
    const clickedInsideDropdown = notificationDropdown?.contains(target);

    if (!clickedInsideDropdown && !clickedOnButton && this.showNotifications) {
      this.showNotifications = false;
    }
  }

  onNotificationRead(notification: number): void {
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    // This should ideally come from a service
    // For now, we'll simulate it by getting the count from the notifications component
    setTimeout(() => {
      const notificationsComponent = document.querySelector('app-notifications');
      if (notificationsComponent) {
        this.unreadCount = this.getUnreadCountFromService();
      }
    }, 100);
  }

  private getUnreadCountFromService(): number {
    // This should be replaced with actual service call
    // For demo, we'll start with 3 unread notifications
    // and decrease as they are marked as read
    return 3;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.alertService.showSuccess("Logged out successfully");
        this.authService.ClearSession(false);
        this.router.navigate(['/']);
      }
      , error: (error) => {
        this.alertService.showError(`Logout failed : ${error.error.errorMessage}`);
      }
    });

  }

  onUpsertCompleted(upsertCompleted: boolean) {
    this.showModal = false;
    this.router.navigate(['/login']);
  }

  private startTokenRefreshInterval() {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      const accessToken = this.cookieService.get('Token');
      const refreshToken = this.cookieService.get('RefreshToken');

      if (!refreshToken) {
        clearInterval(this.refreshInterval);
        this.CommunicationService.isLoggedIn(false);
        return;
      }

      if (!accessToken || this.isTokenExpiringSoon(accessToken, 120)) {
        this.authService.refreshToken(refreshToken).subscribe({
          next: (response) => {

            const newAccessToken = response.result.accessToken;
            const newRefreshToken = response.result.refreshToken;
            const accessTokenExpiry = response.result.expiresIn / 86400;
            const refreshTokenExpiry = response.result.refreshExpiresIn / 86400;

            this.cookieService.set("Token", newAccessToken, accessTokenExpiry);
            this.cookieService.set("RefreshToken", newRefreshToken, refreshTokenExpiry);
            this.CommunicationService.isLoggedIn(true);
          },
          error: (err) => {
            console.error('Token refresh failed', err);
            this.logout();
          }
        });
      } else {
        console.log('Access token still valid → no refresh needed');
      }
    }, 60000);
  }


  private isTokenExpiringSoon(token: string, thresholdSeconds: number = 120): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeLeft = (exp - now) / 1000;
      return exp - now < thresholdSeconds * 1000;
    } catch (e) {
      return true;
    }
  }

  ngOnInit() {
    this.CommunicationService.showNavbar$.subscribe(show => this.showNavbar = show);
    this.CommunicationService.showModal$.subscribe(show => this.showModal = show);

    this.sessionService.sessionReady$.subscribe(isReady => {
      if (isReady) {
        this.initializeNavbar();
      }
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.updateUnreadCount();

    const refreshToken = this.cookieService.get('RefreshToken');

    if (refreshToken) {
      this.CommunicationService.isLoggedIn(true);
      this.startTokenRefreshInterval();
    } else {
      this.CommunicationService.isLoggedIn(false);
    }

  }

  private initializeNavbar() {
  this.CommunicationService.isAdmin$.subscribe(show => this.isAdmin = show);
  this.CommunicationService.isLoggedIn$.subscribe(show => {
    this.loggedIn = show;
    if (this.loggedIn) {
      this.cartService.getCartItems().subscribe();
    }
  });

  if (this.cookieService.get('Token')) {
    this.loggedIn = true;
  }

  if (this.sessionService.getUserRole().toLowerCase() === 'admin') {
    this.isAdmin = true;
  }

  if (this.loggedIn) {
    this.cartService.getCartItems().subscribe();
  }
}

onEnter() {
  const trimmed = this.searchText.trim();
  if (trimmed) {
    this.router.navigate(['/products'], { queryParams: { search: trimmed } });
  }
}

}
