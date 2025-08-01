import { Component, Input } from '@angular/core';
import { ReviewData } from '../../models/reviewData.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-reviews',
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-reviews.component.html',
  styleUrl: './customer-reviews.component.css'
})
export class CustomerReviewsComponent {
  @Input() reviewData: ReviewData = {
    averageRating: 4.0,
    totalReviews: 16281,
    ratingBreakdown: {
      fiveStar: 100,
      fourStar: 22,
      threeStar: 14,
      twoStar: 5,
      oneStar: 9
    }
  };

  @Input() productId: string = '';
  @Input() asModal: boolean = false;

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
}
