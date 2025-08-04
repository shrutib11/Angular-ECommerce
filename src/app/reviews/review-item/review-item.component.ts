import { Component, Input } from '@angular/core';
import { ReviewItem } from '../../models/review-item.model';
import { CommonModule } from '@angular/common';
import { Rating } from '../../models/reviewData.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-review-item',
  imports: [CommonModule],
  templateUrl: './review-item.component.html',
  styleUrl: './review-item.component.css'
})
export class ReviewItemComponent {
  @Input() review!: Rating;

  getCustomerInitial(): string {
    return this.review.reviewerName?.charAt(0).toUpperCase() ?? 'U';
  }

  hasUserProfile(): boolean {
    return !!this.review.userProfile;
  }

  getUserImageUrl(path: string): string {
    const fileName = path?.split('/').pop();
    if (!path || !fileName) {
      return `${environment.baseUrl}/user-uploads/default-profile.png`;
    }
    return `${environment.baseUrl}/user-uploads/${fileName}`;
  }


  getStarArray(): boolean[] {
    const stars = [];
    const fullStars = Math.floor(this.review.ratingValue);

    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return `on ${date.toLocaleDateString('en-GB', options)}`;
  }
}