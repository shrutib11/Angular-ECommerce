import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() interactive: boolean = true;
  @Input() showRatingText: boolean = true;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5];

  onStarClick(starValue: number): void {
    if (this.interactive) {
      this.ratingChange.emit(starValue);
    }
  }

  onStarHover(starValue: number): void {
    if (this.interactive) {
      this.hoverRating = starValue;
    }
  }

  onStarLeave(): void {
    if (this.interactive) {
      this.hoverRating = 0;
    }
  }
}
