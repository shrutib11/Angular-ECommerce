import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductRating } from '../../models/reviewData.model';
import { ReviewDataService } from '../../services/review-data.service';
import { HashidsService } from '../../services/hashids.service';

@Component({
  selector: 'app-customer-reviews',
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-reviews.component.html',
  styleUrl: './customer-reviews.component.css'
})
export class CustomerReviewsComponent{
  @Input() reviewData: ProductRating = {
    avgRating: 4.0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  };

  @Input() productId: string = '';
  @Input() asModal: boolean = false;

  constructor(private router: Router, private reviewDataService: ReviewDataService, private hashedService : HashidsService) {}

  get hashedProductId(): string {
    return this.hashedService.encode(Number(this.productId));
  }

  getStarArray(): boolean[] {
    const stars = [];
    const fullStars = Math.floor(this.reviewData.avgRating);

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }

  goToReviewPage() {
    this.reviewDataService.reviewData = this.reviewData;
    this.router.navigate(['/reviews', this.hashedProductId]);
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
