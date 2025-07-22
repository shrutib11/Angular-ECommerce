import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from '../../user/user-add-edit/user-add-edit.component';
import { UserModel } from '../../models/user.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, UserAddEditComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isRegister: boolean = false;
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
    userImage: ''
  };
  Register() {
    this.isRegister = true;
    this.showModal = true;
  }

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.cartService.getCartItems().subscribe();
  }
}
