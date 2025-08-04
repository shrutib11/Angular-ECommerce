import { Component, OnInit } from '@angular/core';
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
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, IndianCurrencyPipe, CustomerReviewsComponent, StarRatingPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  isLoading = true;
  product: Product = {} as Product;
  category: Category | null = null;
  isLoggedIn: boolean = false;
  isAddingToCart = false;
  showRatingModal = false;

  // productRating: ProductRating = {
  //   avgRating: 0,
  //   totalReviews: 0,
  //   ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  // };

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

    if (this.sessionService.getUserId() != 0) {
      this.isLoggedIn = true
    }

    if (productId) {
      this.isLoading = true;

      this.productService.getProductById(+productId).pipe(
        switchMap(productResponse => {
          this.product = productResponse.result;
          return this.reviewService.getRatingByProduct(+productId).pipe(
            catchError(err => {
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
          console.error("Product fetch failed:", err);
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
}

