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
    private router: Router) { }

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

    onNotificationRead(notification : any )
    {
      console.log("Inside onNotificationRead")
    }

    closeNotifications()
    {

    }

    toggleNotifications()
    {
      this.showNotifications = !this.showNotifications
    }

  Register() {
    this.isRegister = true;
    this.showModal = true;
  }

  logout() {
    this.cookieService.delete("Token");
    this.sessionService.clear();
    this.loggedIn = false;
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
      console.log("HUIfhiuerhfgire")
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
