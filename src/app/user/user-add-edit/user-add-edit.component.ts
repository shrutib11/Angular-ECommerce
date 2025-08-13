import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { AlertService } from '../../shared/alert/alert.service';

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
    userImage: '',
    role: ''
  };
  @Output() closeModal = new EventEmitter<void>();
  imagePreview: string = '';
  isImageChanged: boolean = false;
  userForm: FormGroup = new FormGroup({});
  isSubmitting: boolean = false;
  isEditing: boolean = false;
  @Output() upsertCompleted = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.createForm(this.isEditing);
  }

  removeImage() {
    this.imagePreview = '';
    this.isImageChanged = true;
    this.user.profileImage = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue && this.showModal && changes['user'].currentValue.id !== 0) {
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
      password: ['', isEditMode ? [] : [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/)
      ]],
      address: [this.user.address || '', [Validators.required, Validators.maxLength(200)]],
      userFile: [null, [this.imageValidator]]
    });
  }

  get f() {
    return this.userForm.controls;
  }

  onClose() {
    this.closeModal.emit();
  }

  toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async onSubmit() {
    if (this.userForm.invalid) return;
    this.isSubmitting = true;
    const formData = new FormData();
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (!control) return;

      const pascalKey = this.toPascalCase(key);
      if (key === 'UserFile') {
        const file = control.value;
        
        if (file)
          formData.append('UserImage', file);
        else if (this.imagePreview)
          formData.append('UserImage', this.imagePreview);

        formData.append('ProfileImage', '');
      } else {
        const value = control.value;
        if (value !== null && value !== undefined) {
          formData.append(pascalKey, value);
        }
      }
    });

    if (this.imagePreview == '' && this.isImageChanged) {
      const response = await fetch(`${environment.baseUrl}/user-uploads/default.png`);
      const blob = await response.blob();
      const defaultFile = new File([blob], 'default-profile.png', { type: blob.type });
      formData.append('UserFile', defaultFile);
    }

    if (this.isEditing) {
      formData.append('Id', this.user.id.toString());
      formData.delete('Password');
    }
    else {
      formData.append('Id', '0');
    }
    this.userService.upsert(formData).subscribe({
      next: (response) => {
        this.alertService.showSuccess(`User ${this.isEditing ? 'updated' : 'added'} successfully!`);
        this.user = response.result;
        this.onClose();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.alertService.showError(`Failed to ${this.isEditing ? 'update' : 'add'} user: ${error.error.errorMessage}`);
      },
      complete: () => {
        this.isSubmitting = false;
        this.upsertCompleted.emit(true);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isImageChanged = true;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.userForm.patchValue({ userFile: file });
      this.userForm.get('userFile')?.updateValueAndValidity();

      if (!this.userForm.get('userFile')?.errors) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = '';
      }
    }
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

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0).toUpperCase() || '') + (lastName?.charAt(0).toUpperCase() || '');
  }
}
