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
import { ReviewData } from '../../models/reviewData.model';
import { CustomerReviewsComponent } from '../../reviews/customer-reviews/customer-reviews.component';
import { CartService } from '../../services/cart.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, IndianCurrencyPipe, CustomerReviewsComponent],
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
  reviewData: ReviewData = {
    averageRating: 4.0,
    totalReviews: 16281,
    ratingBreakdown: {
      fiveStar: 50,
      fourStar: 22,
      threeStar: 14,
      twoStar: 5,
      oneStar: 9
    }
  };

  constructor(
    private hashidsService: HashidsService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private alertService: AlertService,
    private cartService: CartService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    const hashedId = this.route.snapshot.paramMap.get('id') || '';
    const productId = this.hashidsService.decode(hashedId);

    if (this.sessionService.getUserId() != 0) {
      this.isLoggedIn = true
    }

    if (productId) {
      this.productService.getProductById(+productId).subscribe({
        next: (response) => {
          this.product = response.result;
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
    const fullStars = Math.floor(this.reviewData.averageRating);

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

