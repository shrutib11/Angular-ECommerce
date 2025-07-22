import { Component } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CartListComponent } from '../cart-list/cart-list.component';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';
import { UpdateQuantityModalComponent } from '../update-quantity-modal/update-quantity-modal.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shopping-cart',
  imports: [CartListComponent, CartSummaryComponent, UpdateQuantityModalComponent],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})
export class ShoppingCartComponent {
  cartItems: CartItem[] = [];

  selectedItem: CartItem | null = null;
  isModalOpen: boolean = false;

  constructor(private cartService : CartService) {
    this.loadCartItems();
  }

  loadCartItems() : void{
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.getCartItems().subscribe();
  }

  onQuantityUpdate(item: CartItem): void {
    this.selectedItem = item;
    this.isModalOpen = true;
  }

  onUpdateQuantity(event: { itemId: number; quantity: number }): void {
    this.cartItems = this.cartItems.map(item =>
      item.id === event.itemId ? { ...item, quantity: event.quantity } : item
    );
  }

  onRemoveItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  onCheckout(): void {
    alert('Proceeding to checkout...');
  }

  onContinueShopping(): void {
    alert('Continuing shopping...');
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
