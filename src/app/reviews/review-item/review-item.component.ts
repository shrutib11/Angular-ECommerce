import { Component, Input } from '@angular/core';
import { ReviewItem } from '../../models/review-item.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-item',
  imports: [CommonModule],
  templateUrl: './review-item.component.html',
  styleUrl: './review-item.component.css'
})
export class ReviewItemComponent {
  @Input() review!: ReviewItem;

  getStarArray(): boolean[] {
    const stars = [];
    const fullStars = Math.floor(this.review.rating);

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