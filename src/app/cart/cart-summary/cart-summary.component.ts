import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  imports: [CommonModule],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.css'
})
export class CartSummaryComponent {
  @Input() items: CartItem[] = [];
  @Output() checkout = new EventEmitter<void>();

  get subtotal(): number {
    const total = this.items.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0);
    return parseFloat(total.toFixed(2));
  }

  get tax(): number {
    return parseFloat((this.subtotal * 0.1).toFixed(2));
  }

  get plateformFee() : number {
    return 20;
  }

  get shipping(): number {
    return this.subtotal > 100 ? 0 : 10;
  }

  get total(): number {
    const total = this.subtotal + this.tax + this.shipping + this.plateformFee;
    return parseFloat(total.toFixed(2));
  }

  get hasFreeShipping(): boolean {
    return this.shipping === 0;
  }

  onCheckout(): void {
    this.checkout.emit();
  }
}
