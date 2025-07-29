import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  constructor(private communicationService : ComponentCommunicationService,private route: ActivatedRoute,private router: Router,private userService : UserService,private alertService : AlertService){}
  resetPassForm : FormGroup = new FormGroup({});
  isLoading : boolean = false;

  ngOnInit() {
    this.communicationService.hideNavbar();
    this.resetPassForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)]),

      confirmPassword: new FormControl('', [Validators.required, Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)])
    }),
    { validators: passwordMatchValidator };
  }



  resetPassword(){
    if(this.resetPassForm.valid){
      this.isLoading = true;
      const userData = {
        email: this.route.snapshot.paramMap.get('email'),
        newPassword: this.resetPassForm.get('newPassword')?.value
      };

      this.userService.resetPassword(userData).subscribe({
        next : (response) => {
            this.alertService.showSuccess("Password updated successfully")
            this.isLoading = false;
            this.router.navigate(['/login']);
        },
        error : (error) => {
          this.isLoading = false;
          this.alertService.showError(error.error.errorMessage);
        }
      })

    }
  }

}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) return null;

  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
};
