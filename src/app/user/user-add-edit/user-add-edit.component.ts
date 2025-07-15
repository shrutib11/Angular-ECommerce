import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-add-edit.component.html',
  styleUrl: './user-add-edit.component.css'
})
export class UserAddEditComponent implements OnChanges {

  @Input() showModal: boolean = false;
  @Input() user: UserModel = {
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
  @Output() closeModal = new EventEmitter<void>();
  imagePreview: string = '';
  userForm: FormGroup = new FormGroup({});
  isSubmitting: boolean = false;
  isEditing: boolean = false;

  constructor(private fb: FormBuilder,private userService: UserService ) {}

  logInvalidControls(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control && control.invalid) {
        console.warn(`❌ Invalid Control: ${key}`, control.errors);
      }
    });
  }
  ngOnInit(): void {
    this.logInvalidControls();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['user'] && changes['user'].currentValue && this.showModal) {
      this.user = changes['user'].currentValue;
      this.isEditing = this.user.id > 0;

      this.createForm(this.isEditing);
    }
  }

  private createForm(isEditMode: boolean): void {
    this.userForm = this.fb.group({
      firstName: [this.user.firstName || '', [Validators.required, Validators.maxLength(50)]],
      lastName: [this.user.lastName || '', [Validators.required, Validators.maxLength(50)]],
      email: [{ value: this.user.email || '', disabled: isEditMode }, [Validators.required, Validators.email]],
      phoneNumber: [this.user.phoneNumber || '', [Validators.required, Validators.pattern(/^\+\d{1,3}[0-9]{10}$/)]],
      pinCode: [this.user.pinCode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: [this.user.password || '', isEditMode ? [] : [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)
      ]],
      userFile: [null, [this.imageValidator]]
    });
  }

  get f() {
    return this.userForm.controls;
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;

    const formData = new FormData();

    // Add all form values to FormData
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);

      if (!control) return;

      if (key === 'userFile') {
        const file = control.value;
        if (file) {
          formData.append('userImage', file); // Use actual backend field name (e.g., 'userImage' or 'userFile')
        }
      } else {
        const value = control.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    // Also include `id` if editing
    if (this.isEditing) {
      formData.append('id', this.user.id.toString());
    }

    this.userService.upsert(formData).subscribe({
      next: (response) => {
        Swal.fire({
          toast: true,
          icon: 'success',
          title: this.isEditing ? 'User updated successfully!' : 'User added successfully!',
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
        this.onClose();
      },
      error: (error) => {
        Swal.fire({
          toast: true,
          icon: 'error',
          title: 'Error occurred while saving user',
          text: error.statusText,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      console.log(this.imagePreview);
      reader.readAsDataURL(file);
      this.userForm.patchValue({ userFile: file });
      this.userForm.get('userFile')?.updateValueAndValidity();
    }
  }


  imageValidator(control: AbstractControl): ValidationErrors | null {
    const file = control.value;
    if (!file) return null;

    const maxSize = 2 * 1024 * 1024; // 2MB
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
    return !path
      ? `${environment.baseUrl}/user-uploads/default-profile.png`
      : `${environment.baseUrl}/user-uploads/${fileName}`;
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0).toUpperCase() || '') + (lastName?.charAt(0).toUpperCase() || '');
  }
}
