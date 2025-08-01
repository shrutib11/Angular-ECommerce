import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-category-add-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-add-edit.component.html',
  styleUrl: './category-add-edit.component.css'
})
export class CategoryAddEditComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() category: Category | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() categoryAdded = new EventEmitter<Category>();

  @ViewChild('fileInput') fileInputRef!: ElementRef;

  categoryForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  imagePreview: string | null = null;
  // submitted: boolean = false;

  ngOnInit(): void {}

  getCategoryImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `${environment.baseUrl}/category-uploads/${fileName}`;
  }

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private alertService : AlertService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]]
    });
  }

  ngOnChanges(): void {
    if (this.showModal && this.category) {
      this.categoryForm.patchValue({
        name: this.category.name,
        description: this.category.description
      });
      this.imagePreview = this.getCategoryImageUrl(this.category.categoryImage);
    }

    // close the form and reopen it then form should be reset
    // if (changes['showModal'] && this.showModal && !this.category) {
    //   this.resetForm();
    // }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const maxSize = 2 * 1024 * 1024;

    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExt!)) {
        this.alertService.showError("Only JPG, JPEG, PNG, and WEBP image files are allowed.");
        this.selectedFile = null;
        this.imagePreview = null;
        this.fileInputRef.nativeElement.value = '';
        return;
      }
      if (file.size > maxSize) {
        this.alertService.showError("Image size must be less than or equal to 2MB.");
        this.selectedFile = null;
        this.imagePreview = null;
        this.fileInputRef.nativeElement.value = '';
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    // this.submitted = true;

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('name', this.categoryForm.get('name')?.value);
    formData.append('description', this.categoryForm.get('description')?.value);
    formData.append('categoryFile', this.selectedFile!);

    if (this.category) {
      formData.append('id', this.category.id.toString());
      this.categoryService.updateCategory(formData).subscribe({
        next: (res) => {this.handleSuccess('Category updated successfully!', res.result);
          localStorage.setItem('category-' + this.category?.id, JSON.stringify(res.result));
        },
        error: () => this.alertService.showError('Failed to update')
      });
    } else {
      this.categoryService.addCategory(formData).subscribe({
        next: (res) => this.handleSuccess('Category added successfully!', res.result),
        error: () => this.alertService.showError('Failed to add')
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

  private handleSuccess(message: string, category: Category) {
    this.alertService.showSuccess(message);
    this.afterSave(category);
  }

  resetForm() {
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
    // this.submitted = false;
  }

  get name() { return this.categoryForm.get('name'); }
  get description() { return this.categoryForm.get('description'); }

  private afterSave(category: Category) {
    this.resetForm();
    this.categoryAdded.emit(category);
    this.onClose();
  }
}
