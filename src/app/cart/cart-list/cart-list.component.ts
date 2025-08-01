import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation/delete-confirmation.component';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../shared/alert/alert.service';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';
import { ThankYouModalComponent } from '../../reviews/thank-you-modal/thank-you-modal.component';
import { WriteReviewComponent } from '../../reviews/write-review/write-review.component';
import { Review } from '../../models/reviewData.model';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-cart-list',
  imports: [CommonModule, DeleteConfirmationComponent, IndianCurrencyPipe, ThankYouModalComponent, WriteReviewComponent],
  templateUrl: './cart-list.component.html',
  styleUrl: './cart-list.component.css'
})

export class CartListComponent {
  @Input() items: CartItem[] = [];
  @Output() quantityUpdate = new EventEmitter<CartItem>();
  @Output() removeItem = new EventEmitter<number>();
  showWriteReview = false;
  showThankYou = false;
  currentUserId = '5';

  showDeleteModal: boolean = false;
  itemToDelete: CartItem | null = null;
  selectedReviewItem: any = null;

  constructor(
    private cartService : CartService,
    private alertService : AlertService,
    private router : Router,
    private reviewService: ReviewService
  ) {}

  getCartImageUrl(path: string): string {
      const fileName = path.split('/').pop();
      return `${environment.baseUrl}/product-uploads/${fileName}`;
    }

  onQuantityUpdate(item: CartItem): void {
    this.quantityUpdate.emit(item);
  }

  onRemoveItem(item: CartItem): void {
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (this.itemToDelete) {
      this.cartService.removeFromCart(this.itemToDelete.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.alertService.showSuccess('Item Removed Successfully')
        },
        error: () => {
          this.closeDeleteModal();
        }
      });
    }
  }

  onDeleteCancelled(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  openReviewModal(item: any): void {
    this.selectedReviewItem = item;
    this.showWriteReview = true;
  }

  closeWriteReview(): void {
    this.selectedReviewItem = null;
    this.showWriteReview = false;
  }

  closeThankYou(): void {
    this.showThankYou = false;
  }

  async handleReviewSubmit(reviewData: Review): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("userId", reviewData.userId)
      formData.append("orderId", reviewData.orderId)
      formData.append("productId", reviewData.productId)
      formData.append("ratingValue", reviewData.ratingValue.toString())
      formData.append("comment", reviewData.comment)

      this.reviewService.addRating(formData).subscribe({
        next: (response) => {
          if(response.isSuccess){
            this.alertService.showSuccess("Feeded Added SuccessFully")
            this.showThankYou = true;
          }
          else
            this.alertService.showError(response.errorMessage!)
        },
        error: (error) => {
          this.alertService.showWarning(error.error.ErrorMessage)
        }
      });

      this.showWriteReview = false;
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  }

  handleContinueShopping(): void {
    this.router.navigate(['/products']);
  }
}