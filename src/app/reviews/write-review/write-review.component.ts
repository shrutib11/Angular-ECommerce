import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Review } from '../../models/reviewData.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-write-review',
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './write-review.component.html',
  styleUrl: './write-review.component.css'
})
export class WriteReviewComponent {
  @Input() isOpen: boolean = false;
  @Input() productId: string = '';
  @Input() orderId: string = '';
  @Input() productName: string = 'this product';
  @Input() userId: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Review>();

  rating: number = 0;
  comments: string = '';
  isSubmitting: boolean = false;
  errors: any = {};

  ngOnInit(): void {
    this.resetForm();
  }

  onRatingChange(newRating: number): void {
    this.rating = newRating;
    if (this.errors.rating) {
      delete this.errors.rating;
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (this.rating === 0) {
      this.errors.rating = 'Please select a rating';
    }

    return Object.keys(this.errors).length === 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const reviewData: Review = {
        userId: this.userId || 'current-user-id',
        productId: this.productId,
        orderId: this.orderId,
        ratingValue: this.rating,
        comment: this.comments.trim()
      };

      this.submit.emit(reviewData);
      this.resetForm();
    } catch (error) {
      console.error('Error submitting review:', error);
      this.errors.submit = 'Failed to submit review. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.resetForm();
      this.close.emit();
    }
  }

  onOverlayClick(event: Event): void {
    if (!this.isSubmitting) {
      this.onClose();
    }
  }

  private resetForm(): void {
    this.rating = 0;
    this.comments = '';
    this.errors = {};
    this.isSubmitting = false;
  }
}
