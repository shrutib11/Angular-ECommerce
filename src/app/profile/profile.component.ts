import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AlertService } from '../shared/alert/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  isEditing = false;
  imagePreview: string = '';
  currentUser: UserModel | null = null;
  userProfileForm: FormGroup = new FormGroup({});
  formReady: boolean = false;
  private originalProfileData!: UserModel
  originalValues = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: '123 Main Street, Anytown, State 12345',
    pinCode: '123456'
  };

  currentValues = { ...this.originalValues };

  constructor(private userService: UserService, private sessionService: SessionService, private fb: FormBuilder,private alertService : AlertService,
    private router: Router
  ) {
  }

  private createForm(): void {
    this.userProfileForm = this.fb.group({
      id : [this.currentUser?.id],
      firstName: [this.currentUser?.firstName || '', [Validators.required, Validators.maxLength(50)]],
      lastName: [this.currentUser?.lastName || '', [Validators.required, Validators.maxLength(50)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [this.currentUser?.phoneNumber || '', [Validators.required, Validators.pattern(/^\+\d{1,3}[1-9]{1}[0-9]{10}$/)]],
      pinCode: [this.currentUser?.pinCode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      address: [this.currentUser?.address || '', [Validators.required, Validators.maxLength(200)]],
      userFile: [null, [this.imageValidator]]
    });
  }

  ngOnInit() {
    this.sessionService.sessionReady$.subscribe((ready) => {
      if (ready) {
        const userId = this.sessionService.getUserId();
        this.userService.getCurrentUserDetails(userId).subscribe({
          next: (response) => {
            console.log('User details:', response);
            this.currentUser = response.result;
            this.createForm();
            this.formReady = true;
            this.originalProfileData = { ...this.currentUser };
          },
          error: () => {
            this.router.navigate(['/login']);
          }
        });
      }else{
        this.router.navigate(['/login']);
      }
    });
  }


  onSubmit() {
    if (this.userProfileForm.valid) {
      const formData = new FormData();
      Object.keys(this.userProfileForm.controls).forEach(key => {
        const control = this.userProfileForm.get(key);
        if (!control) return;
        const pascalKey = this.toPascalCase(key);
        formData.append(pascalKey,control.value);
      });

      this.userService.upsert(formData).subscribe({
        next : (response)=>{
          this.alertService.showSuccess(`profile updated successfully!`);
          this.isEditing = false;
          this.currentUser = {...response.result};
        },
        error : (error)=>{
          this.alertService.showError(`Failed to update profile : ${error.error.errorMessage}`);
          this.isEditing = false;
        }

      })
    }
  }

  toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  enableEdit() {
    this.isEditing = true;
  }

  saveChanges() {
    this.originalValues = { ...this.currentValues };
    this.isEditing = false;
  }

  cancelEdit() {
    this.userProfileForm.patchValue({ ...this.originalProfileData });
    this.imagePreview = '';
    this.isEditing = false;
  }

  imageValidator(control: AbstractControl): ValidationErrors | null {
    const file = control.value;
    if (!file) return null;

    const maxSize = 2 * 1024 * 1024;
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file?.name?.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(ext)) {
      return { invalidExtension: 'Only JPG, JPEG, PNG, and WEBP image files are allowed.' };
    }
    if (file.size > maxSize) {
      return { maxSize: 'Image size must be less than or equal to 2MB.' };
    }
    return null;
  }

  getUserImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    if (path === '' || !fileName) {
      return `${environment.baseUrl}/user-uploads/default-profile.png`
    }
    return `${environment.baseUrl}/user-uploads/${fileName}`;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.userProfileForm.get('userFile')?.setValue(file);
      this.userProfileForm.get('userFile')?.updateValueAndValidity();
      if (!this.userProfileForm.get('userFile')?.errors) {
        this.userProfileForm.patchValue({ userImage: file });
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }

  }




}
