import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-update-quantity-modal',
  imports: [CommonModule],
  templateUrl: './update-quantity-modal.component.html',
  styleUrl: './update-quantity-modal.component.css'
})
export class UpdateQuantityModalComponent {
  @Input() item: CartItem | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<{ itemId: number; quantity: number }>();

  quantity: number = 1;

  constructor(private cartService : CartService, private alertService : AlertService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && this.item) {
      this.quantity = this.item.quantity;
    }
  }

  onQuantityChange(change: number): void {
    this.quantity = Math.max(1, this.quantity + change);
  }

  onClose(): void {
    this.close.emit();
  }

  onDone(): void {
    if (this.item) {
      this.cartService.updateItemQuantity(this.item.id, this.quantity).subscribe({
        next: () => {
          this.close.emit()
          this.alertService.showSuccess("Quantity Updated Sucessfully")
        },
        error: (err) => {
          this.alertService.showError('Failed to update quantity');
          this.close.emit();
        }
      });
    } else {
      this.close.emit();
    }
  }


  get totalPrice(): number {
    return this.item ? this.item.priceAtAddTime * this.quantity : 0;
  }

  get isMinQuantity(): boolean {
    return this.quantity <= 1;
  }
}
