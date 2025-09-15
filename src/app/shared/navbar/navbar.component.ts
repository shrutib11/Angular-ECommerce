import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from '../../user/user-add-edit/user-add-edit.component';
import { UserModel } from '../../models/user.model';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SessionService } from '../../services/session.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../notifications/notifications.component';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, UserAddEditComponent, CommonModule, FormsModule, NotificationsComponent],
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

  constructor(private CommunicationService: ComponentCommunicationService,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private cartService: CartService,
    private router: Router,
    private keycloakService: KeycloakService) {
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

  Register() {
    this.isRegister = true;
    this.showModal = true;
  }

  logout() {
    this.keycloakService.logout();
    this.cookieService.deleteAll();
    this.sessionService.clear();
    this.CommunicationService.isLoggedIn(false);
    this.sessionService.markSessionReady(); 
    this.router.navigate(['/']);
  }

  onUpsertCompleted(upsertCompleted: boolean) {
    this.showModal = false;
    this.keycloakService.login();
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
  }

  login() {
    this.keycloakService.login();
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
