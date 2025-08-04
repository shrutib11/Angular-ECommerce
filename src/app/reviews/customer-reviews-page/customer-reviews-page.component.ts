import { Component } from '@angular/core';
import { ReviewItem } from '../../models/review-item.model';
import { ActivatedRoute } from '@angular/router';
import { ReviewListComponent } from '../review-list/review-list.component';
import { CustomerReviewsComponent } from '../customer-reviews/customer-reviews.component';
import { ProductRating, Rating } from '../../models/reviewData.model';
import { ReviewDataService } from '../../services/review-data.service';
import { ReviewService } from '../../services/review.service';
import { HashidsService } from '../../services/hashids.service';

@Component({
  selector: 'app-customer-reviews-page',
  imports: [ReviewListComponent, CustomerReviewsComponent],
  templateUrl: './customer-reviews-page.component.html',
  styleUrl: './customer-reviews-page.component.css'
})
export class CustomerReviewsPageComponent {
  productId: string = '';

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

  reviews: Rating[] = [];

  constructor(private route: ActivatedRoute, private reviewDataService: ReviewDataService, private reviewService: ReviewService, private hashidsService: HashidsService) { }

  ngOnInit(): void {
    const hashedId = this.route.snapshot.paramMap.get('id') || '';
    const productId = this.hashidsService.decode(hashedId);

    if (productId) {
      this.productId = productId.toString();
      this.reviewData = this.reviewDataService.reviewData;

      if (!this.reviewData) {
        this.fetchReviewDataFromApi(+this.productId);
      }
      this.getRatingsByProduct()
    }
  }

  private fetchReviewDataFromApi(productId: number): void {
    this.reviewService.getRatingByProduct(productId).subscribe(data => {
      this.reviewData = data;
      this.reviewDataService.reviewData = data;
    });
  }

  private getRatingsByProduct(): void {
    this.reviewService.getCustomerRatings(Number(this.productId)).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => {
        console.error('Error fetching ratings:', err);
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}