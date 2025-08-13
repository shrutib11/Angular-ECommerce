import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit, SimpleChanges, QueryList, ViewChildren } from '@angular/core';
import { Product, ProductMedia } from '../../models/product.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { AlertService } from '../../shared/alert/alert.service';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { CdkDragDrop, CdkDragMove, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-product-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './product-add-edit.component.html',
  styleUrl: './product-add-edit.component.css'
})
export class ProductAddEditComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() product: Product | null = null;
  @Input() catId: number | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() productAddEdit = new EventEmitter<Product>();

  productForm!: FormGroup;
  isSubmitting: boolean = false;
  submitted: boolean = false;
  isOnlyVideos: boolean = false;
  fileTouched:boolean = false;

  categories: Category[] = [];
  mediaList: ProductMedia[] = [];

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  hoveredTargetIndex: number | null = null;
  @ViewChildren('videoRef') videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;

  videoStates: { isPlaying: boolean; showIcon: boolean}[] = [];


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

      if (this.product.productMedias?.length) {
        this.mediaList = this.product.productMedias.map((media) => ({
          ...media,
          mediaUrl: `${environment.baseUrl}/product-uploads/${media.mediaUrl.split('/').pop()}`
        }));
      }

      this.initializeVideoStates();
    }
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    if (this.mediaList.length + newFiles.length > 6) {
      this.alertService.showWarning('Max 6 media files allowed.');
      return;
    }

    console.log('Media select:', this.productForm.invalid, this.mediaList);
    console.log(this.isOnlyVideos, this.isSubmitting,this.submitted);

    newFiles.forEach((file, index) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
      const isVideo = ['mp4', 'mp3'].includes(ext);

      if (!isImage && !isVideo) {
        this.alertService.showWarning('Only images and videos are allowed.');
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (isImage && fileSizeMB > 2) {
        this.alertService.showWarning(`Image "${file.name}" exceeds 2MB limit.`);
        return;
      }
      if (isVideo && fileSizeMB > 10) {
        this.alertService.showWarning(`Video "${file.name}" exceeds 10MB limit.`);
        return;
      }

      const isFirstUpload = this.mediaList.length === 0 && index === 0;
      if (isFirstUpload && !isImage) {
        this.alertService.showWarning('The first media file must be an image.(main thumbnail for product)');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const media: ProductMedia = {
          id: 0,
          productId: 0,
          mediaUrl: e.target?.result as string,
          mediaFile: file,
          mediaType: isImage ? 'Image' : 'Video',
          displayOrder: this.mediaList.length + 1
        };
        this.mediaList.push(media);
        this.recalculateDisplayOrder();
      };

      reader.readAsDataURL(file);
    });

    this.fileInputRef.nativeElement.value = '';
  }

  removeMedia(index: number) {
    this.mediaList.splice(index, 1);
    console.log('Media removed:', this.productForm.invalid, this.mediaList);
    console.log(this.isOnlyVideos, this.isSubmitting,this.submitted);
    this.recalculateDisplayOrder();
  }

  recalculateDisplayOrder() {
    const firstImageIndex = this.mediaList.findIndex(m => m.mediaType === 'Image');
    console.log('First image index:', firstImageIndex);

    if (firstImageIndex === -1 && this.mediaList.length > 0) {
      this.isOnlyVideos = true;
      this.alertService.showWarning('At least one image is required as the first media. (Main product thumbnail)');
    } else if (firstImageIndex !== 0 && firstImageIndex !== -1) {
      this.isOnlyVideos = false;
      const image = this.mediaList[firstImageIndex];
      this.mediaList.splice(firstImageIndex, 1);
      this.mediaList.unshift(image);
    }else{
      this.isOnlyVideos = false;

    }
    this.mediaList.forEach((m, i) => m.displayOrder = i + 1);
  }

  // ngAfterViewInit() {
  //   this.initializeVideoStates();
  // }

  initializeVideoStates(): void {
    this.videoStates = this.mediaList.map(() => ({
      isPlaying: false,
      showIcon: true
    }));
  }

  toggleVideo(video: HTMLVideoElement, index: number): void {
    if (!video) return;

    if (video.paused) {
      video.play();
      this.videoStates[index] = { isPlaying: true, showIcon: false };
    } else {
      video.pause();
      this.videoStates[index] = { isPlaying: false, showIcon: true };
    }
  }

  onDrop(event: CdkDragDrop<ProductMedia[]>): void {
    if (this.hoveredTargetIndex == null) return;

    const draggedMedia = this.mediaList[event.previousIndex];
    const targetMedia = this.mediaList[this.hoveredTargetIndex];

    if (!draggedMedia || !targetMedia) return;

    if ((targetMedia.displayOrder === 1 && draggedMedia.mediaType !== 'Image') ||
        (draggedMedia.displayOrder === 1 && targetMedia.mediaType !== 'Image')) {
      this.alertService.showWarning('The first media must be an image. (Main product thumbnail)');
      this.hoveredTargetIndex = null;
      return;
    }

    const temp = draggedMedia.displayOrder;
    draggedMedia.displayOrder = targetMedia.displayOrder;
    targetMedia.displayOrder = temp;

    this.mediaList.sort((a, b) => a.displayOrder - b.displayOrder);
    this.hoveredTargetIndex = null;
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

    this.mediaList.forEach((media, index) => {
      formData.append(`ProductMedias[${index}].id`, media.id.toString());
      formData.append(`ProductMedias[${index}].productId`, media.productId.toString());
      formData.append(`ProductMedias[${index}].mediaType`, media.mediaType);
      formData.append(`ProductMedias[${index}].mediaUrl`, media.mediaUrl);
      formData.append(`ProductMedias[${index}].displayOrder`, media.displayOrder.toString());

      if (media.mediaFile) {
        formData.append(`ProductMedias[${index}].mediaFile`, media.mediaFile);
      }
    });

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
      // console.log([...formData.entries()]);
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
    this.mediaList = [...[]];
    this.isSubmitting = false;
    this.submitted = false;
    this.isOnlyVideos = false;
    this.fileTouched = false;
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

