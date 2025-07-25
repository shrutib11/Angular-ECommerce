import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from '../../user/user-add-edit/user-add-edit.component';
import { UserModel } from '../../models/user.model';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SessionService } from '../../services/session.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, UserAddEditComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isRegister: boolean = false;
  showNavbar: boolean = true;
  isAdmin: boolean = false;
  loggedIn: boolean = false;

  @Input() showModal: boolean = false;
  cartCount: number = 0;
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

  constructor(private CommunicationService: ComponentCommunicationService,
    private sessionService: SessionService,
    private cookieService: CookieService,
    private cartService: CartService,
    private userService: UserService) { }

  Register() {
    this.isRegister = true;
    this.showModal = true;
  }

  logout() {

    this.userService.userlogout().subscribe({
      next: (response) => {
        this.cookieService.delete("Token");
        this.sessionService.clear();
      },
      error: (err) => {
      }
    });
  }

  ngOnInit() {
    this.CommunicationService.showModal$.subscribe(show => {
      this.showModal = show
    })
    this.CommunicationService.showNavbar$.subscribe(show => {
      this.showNavbar = show
    })
    this.CommunicationService.isAdmin$.subscribe(show => {
      this.isAdmin = show
    })
    this.CommunicationService.isLoggedIn$.subscribe(show => {
      this.loggedIn = show
    })
    if (this.cookieService.get('Token')) {
      this.loggedIn = true;
    }
    if (this.sessionService.getUserRole().toLowerCase() == 'admin') {
      this.isAdmin = true;
    }
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    if(this.loggedIn)
      this.cartService.getCartItems().subscribe();
  }
}
