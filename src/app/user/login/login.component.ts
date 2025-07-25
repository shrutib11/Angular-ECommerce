import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';
import { AlertService } from '../../shared/alert/alert.service';
import { AppCookieService } from '../../services/cookie.service';
import { SessionService } from '../../services/session.service';
import { Router } from '@angular/router';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { CartService } from '../../services/cart.service';
import { CartModel } from '../../models/cart.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  loginForm: FormGroup = new FormGroup({});
  passwordVisible: boolean = false;
  // @Output() onRegister = new EventEmitter<void>();
  isSubmitted = false;
  userCart: CartModel = {
    id: null,
    userId: 0,
  };

  constructor(private authService: AuthenticationService,
    private alertService: AlertService,
    private cookieService: AppCookieService,
    private router: Router,
    private sessionService: SessionService,
    private modalService: ComponentCommunicationService,
    private cartService: CartService) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)])
    })
  }

  Register() {
    this.modalService.openModal();
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  ngOnInit() {
    this.modalService.hideNavbar();
  }

  onLogin() {
    this.isSubmitted = true;
    const formData = new FormData();
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control && control.value !== null && control.value !== undefined) {
        formData.append(key, control.value);
      }
    });

    if (this.loginForm.valid) {
      this.authService.login(formData).subscribe({
        next: (response) => {
          this.alertService.showSuccess('Login successful');
          this.cookieService.setCookie("Token", response.result.token, 7);
          this.sessionService.setUserId(response.result.user.id);
          this.sessionService.setEmail(response.result.user.email);
          this.sessionService.setUserRole(response.result.user.role);
          this.modalService.isLoggedIn(true);
          if (response.result.user.role == "User") {
            this.modalService.userRole();
          }
          else {
            this.modalService.adminRole();
          }
          this.cartService.getUserCart(response.result.user.id).subscribe({
            next: (response) => {
              this.userCart = { ...response.result };
              this.sessionService.setCartId(this.userCart.id!);
            },
            error: (error: any) => {
              if (error.error.statusCode == 404) {
                this.userCart.userId = this.sessionService.getUserId();
                this.cartService.createCart(this.userCart).subscribe({
                  next: (response) => {
                    this.userCart = { ...response.result };
                    this.sessionService.setCartId(this.userCart.id!);
                  },
                  error: (error: any) => {
                    this.alertService.showError(`failed to create cart : ${error.error.errorMessage}`);
                  }
                })
              }
            }
          })
          this.router.navigate(['/']);
          this.modalService.showNavbar();
        },
        error: (error: any) => {
          this.isSubmitted = false
          this.alertService.showError(`Login failed : ${error.error.errorMessage}`)
        }
      })
    }
  }
}
