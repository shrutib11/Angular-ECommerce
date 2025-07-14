import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-add-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-add-edit.component.html',
  styleUrl: './category-add-edit.component.css'
})
export class CategoryAddEditComponent {
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() categoryAdded = new EventEmitter<Category>();
  @ViewChild('fileInput') fileInputRef!: ElementRef;

  categoryForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.categoryForm.valid && this.selectedFile) {
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('name', this.categoryForm.get('name')?.value);
      formData.append('description', this.categoryForm.get('description')?.value);
      formData.append('categoryFile', this.selectedFile);

      this.categoryService.addCategory(formData).subscribe({
        next: (response) => {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Category added successfully!',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });

          this.resetForm();
          this.categoryAdded.emit(response.result);
          this.onClose();
        },
        error: (error) => {
          Swal.fire({
            toast: true,
            icon: 'error',
            title: "Failed To Add",
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  onClose() {
    this.resetForm();
    this.closeModal.emit();
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  resetForm() {
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
  }

  get name() { return this.categoryForm.get('name'); }
  get description() { return this.categoryForm.get('description'); }
}
