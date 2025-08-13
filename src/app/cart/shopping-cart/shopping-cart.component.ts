import { Component } from '@angular/core';
import { CartItem } from '../../models/cart-item.model';
import { CartListComponent } from '../cart-list/cart-list.component';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';
import { UpdateQuantityModalComponent } from '../update-quantity-modal/update-quantity-modal.component';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  imports: [CartListComponent, CartSummaryComponent, UpdateQuantityModalComponent, CommonModule, RouterModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})

export class ShoppingCartComponent {
  cartItems: CartItem[] = [];

  selectedItem: CartItem | null = null;
  isModalOpen: boolean = false;

  constructor(private cartService : CartService, private router : Router) {
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
    // alert('Proceeding to checkout...');
  }

  onContinueShopping(): void {
    this.router.navigate(['/products']);
  }

  onCloseModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  onStartShopping() {
    this.router.navigate(['/products']);
  }
}
