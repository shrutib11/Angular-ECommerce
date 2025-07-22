import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation/delete-confirmation.component';
import { environment } from '../../../environments/environment';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-cart-list',
  imports: [CommonModule, DeleteConfirmationComponent],
  templateUrl: './cart-list.component.html',
  styleUrl: './cart-list.component.css'
})

export class CartListComponent {
  @Input() items: CartItem[] = [];
  @Output() quantityUpdate = new EventEmitter<CartItem>();
  @Output() removeItem = new EventEmitter<number>();

  showDeleteModal: boolean = false;
  itemToDelete: CartItem | null = null;

  constructor(private cartService : CartService, private alertService : AlertService) {}

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
        error: (err) => {
          console.error('Error removing item:', err);
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
}
