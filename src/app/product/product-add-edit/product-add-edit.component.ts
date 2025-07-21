import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit, SimpleChanges } from '@angular/core';
import { Product } from '../../models/product.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { AlertService } from '../../shared/alert/alert.service';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-product-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-add-edit.component.html',
  styleUrl: './product-add-edit.component.css'
})
export class ProductAddEditComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() product: Product | null = null;
  @Input() catId: number | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() productAddEdit = new EventEmitter<Product>();

  @ViewChild('fileInput') fileInputRef!: ElementRef;

  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting: boolean = false;
  submitted: boolean = false;

  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchCategories();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      price: [null, [Validators.required, Validators.min(1)]],
      stockQuantity: [null, [Validators.required, Validators.min(0)]],
      categoryId: [this.catId ?? '', [Validators.required, Validators.min(1)]]
    });
  }

  fetchCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.result;
      },
      error: (err) => {
        this.alertService.showError(err?.error?.errorMessage || 'Failed to load categories.');
      }
    });
  }

  ngOnChanges(): void {
    if (this.productForm && this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        stockQuantity: this.product.stockQuantity,
        categoryId: this.product.categoryId,
        productImage: this.product.productImage
      });

      if (this.product.productImage) {
        this.imagePreview = `${environment.baseUrl}/product-uploads/${this.product.productImage.split('/').pop()}`;
      }
    }
  }

  onFileSelected(event: any): void {
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

  onSubmit(): void {

    if (this.productForm.invalid) return;

    this.submitted = true;
    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('name', this.productForm.get('name')?.value);
    formData.append('description', this.productForm.get('description')?.value);
    formData.append('price', this.productForm.get('price')?.value);
    formData.append('stockQuantity', this.productForm.get('stockQuantity')?.value);
    formData.append('categoryId', this.productForm.get('categoryId')?.value);
    if (this.selectedFile) {
      formData.append('productImageFile', this.selectedFile);
    }

    if (this.product?.id) {
      formData.append('id', this.product?.id.toString());
      this.productService.updateProduct(formData).subscribe({
        next: (response) => {
          this.alertService.showSuccess('Product updated successfully!');
          this.productAddEdit.emit(response.result);
          this.close();
        },
        error: (err) => this.alertService.showError(err?.error?.errorMessage || 'Failed to update product.')
      });
    } else {
      this.productService.addProduct(formData).subscribe({
        next: (response) => {
          this.alertService.showSuccess('Product added successfully!');
          this.productAddEdit.emit(response.result);
          this.close();
        },
        error: (err) => this.alertService.showError(err?.error?.errorMessage || 'Failed to add product.')
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.isSubmitting = false;
    this.submitted = false;
  }

  close(): void {
    this.closeModal.emit();
    this.resetForm();
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  get name() { return this.productForm?.get('name'); }
  get description() { return this.productForm?.get('description'); }
  get price() { return this.productForm?.get('price'); }
  get stockQuantity() { return this.productForm?.get('stockQuantity'); }
  get categoryId() { return this.productForm?.get('categoryId'); }
  get productImage() { return this.productForm?.get('productImage'); }

}

