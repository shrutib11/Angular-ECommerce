import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';
import { AlertService } from '../../shared/alert/alert.service';
import { HashidsService } from '../../services/hashids.service';
import { ProductRating } from '../../models/reviewData.model';
import { CustomerReviewsComponent } from '../../reviews/customer-reviews/customer-reviews.component';
import { CartService } from '../../services/cart.service';
import { SessionService } from '../../services/session.service';
import { StarRatingPipe } from '../../shared/pipes/star-rating.pipe';
import { catchError, of, switchMap } from 'rxjs';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, IndianCurrencyPipe, CustomerReviewsComponent, StarRatingPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  @ViewChild('mainImage', { static: false }) mainImageRef!: ElementRef<HTMLImageElement>;

  isLoading = true;
  product: Product = {} as Product;
  category: Category | null = null;
  isLoggedIn: boolean = false;
  isAddingToCart = false;
  showRatingModal = false;

  sortedImages: string[] = [];
  currentImageIndex = 0;

  showZoom = false;
  lensPosition = { x: 0, y: 0 };
  zoomBackgroundPosition = '0% 0%';
  zoomBackgroundSize = '200%';

  videoStates: { isPlaying: boolean, showIcon: boolean }[] = [];
  isPLayingVideo: boolean = false;
  isShowingIcon: boolean = true;
  duration: number = 0;
  currentTime: number = 0;
  progressPercent: number = 0;
  showControls = false;

  reviewData: ProductRating = {
    avgRating: 0.0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  };

  constructor(
    private hashidsService: HashidsService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private cartService: CartService,
    private sessionService: SessionService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    const hashedId = this.route.snapshot.paramMap.get('id') || '';
    const productId = this.hashidsService.decode(hashedId);

    this.sessionService.sessionReady$.subscribe(isReady => {
      if (isReady && this.sessionService.getUserId() != 0) {
        this.isLoggedIn = true
      }
    });

    if (productId) {
      this.isLoading = true;

      this.productService.getProductById(+productId).pipe(
        switchMap(productResponse => {
          this.product = productResponse.result;
          this.initializeImageGallery();
          this.InitializeVideoStates();
          return this.reviewService.getRatingByProduct(+productId).pipe(
            catchError(err => {
              console.log("hii " + err?.status)
              if (err?.status === 404) {
                this.reviewData = this.reviewData;
              }
              return of(null);
            })
          );
        })
      ).subscribe({
        next: (ratingResponse) => {
          if (ratingResponse) {
            this.reviewData = ratingResponse;
          }
          this.isLoading = false;
          this.fetchCategory(this.product.categoryId.toString());
        },
        error: (err) => {
          this.isLoading = false;
          this.alertService.showError('Failed to load product details. Please try again later.');
        }
      });
    }

  }

  fetchCategory(categoryId: string): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        this.category = response.result;
      },
      error: (err) => {
        this.alertService.showError('Failed to load category details. Please try again later.');
      }
    });
  }

  getProductImageUrl(path: string): string {
    if (path) {
      const fileName = path.split('/').pop();
      return `${environment.baseUrl}/product-uploads/${fileName}`;
    }
    return ''
  }

  getStarArray(): boolean[] {
    const stars = [];
    const fullStars = Math.floor(this.reviewData.avgRating);

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  onAddToCart(): void {
    if (this.isAddingToCart) return;

    this.isAddingToCart = true;

    this.cartService.addOrUpdateCartItem(this.product, this.isLoggedIn).subscribe({
      next: () => {
        this.alertService.showSuccess('Item added/updated in cart');
        this.isAddingToCart = false;
      },
      error: (err) => {
        if (err.message !== 'Not logged in') {
          this.alertService.showError('Error adding to cart');
        }
        this.isAddingToCart = false;
      }
    });
  }

  private initializeImageGallery(): void {
    if (this.product.productMedias.length > 0) {
      this.sortedImages = this.product.productMedias
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(media => media.mediaUrl);
      this.currentImageIndex = 0;
    } else {
      this.sortedImages = [];
    }

  }

  InitializeVideoStates(): void {
    this.videoStates = this.product.productMedias.map((media) => ({
      isPlaying: false,
      showIcon: media.mediaType === 'Video' ? true : false
    }));
  }

  getCurrentImage(): string {
    if (this.sortedImages.length > 0) {
      return this.getProductImageUrl(this.sortedImages[this.currentImageIndex]);
    }
    return this.getProductImageUrl(this.product.productImage);
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.sortedImages.length) {
      this.currentImageIndex = index;
    }
  }

  previousImage(): void {
    const len = this.sortedImages.length;
    if (len > 0) {
      this.currentImageIndex = this.currentImageIndex > 0
        ? this.currentImageIndex - 1
        : len - 1;
    }
  }

  nextImage(): void {
    const len = this.sortedImages.length;
    if (len > 0) {
      this.currentImageIndex = this.currentImageIndex < len - 1 ? this.currentImageIndex + 1 : 0;
    }
  }

  getTotalImages(): number {
    return this.sortedImages.length;
  }

  getCurrentImageNumber(): number {
    return this.currentImageIndex + 1;
  }

  isActiveImage(index: number): boolean {
    return this.currentImageIndex === index;
  }

  onImageMouseMove(event: MouseEvent) {
    const rect = this.mainImageRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // From css width-height
    const lensWidth = 150;
    const lensHeight = 150;

    let lensX = x - lensWidth / 2;
    let lensY = y - lensHeight / 2;

    // lens stays inside image
    lensX = Math.max(0, Math.min(lensX, rect.width - lensWidth));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensHeight));

    this.lensPosition = { x: lensX, y: lensY };

    // From css width-height
    const zoomWidth = 650;
    const zoomHeight = 650;

    const cx = zoomWidth / lensWidth;
    const cy = zoomHeight / lensHeight;

    this.zoomBackgroundSize = `${rect.width * cx}px ${rect.height * cy}px`;
    this.zoomBackgroundPosition = `-${lensX * cx}px -${lensY * cy}px`;
  }

}