import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../shared/alert/alert.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-product-card',
  imports: [RouterModule,CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product: any;
  hover = false;
  isAddingToCart = false;
  @Output() editClicked = new EventEmitter<Product>();
  @Output() deleteClicked = new EventEmitter<{ id: string, name: string }>();

  constructor(private cartService: CartService, private alertService : AlertService) { }

  getProductImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `${environment.baseUrl}/product-uploads/${fileName}`;
  }

  onEditClick() {
    this.editClicked.emit(this.product);
  }

  onDeleteClick() {
    this.deleteClicked.emit({
      id: this.product.id,
      name: this.product.name
    });
  }

  onAddToCart(): void {
    if (this.isAddingToCart) return;

    this.isAddingToCart = true;

    //unsubscribe automatically from cartItems$ observable after getting the latest cart list once.
    this.cartService.cartItems$.pipe(take(1)).subscribe((items) => {
      const existingItem = items.find(item => item.productId === this.product.id);

      if (existingItem) {
        const newQuantity = (existingItem.quantity ?? 0) + 1;

        this.cartService.updateItemQuantity(existingItem.id, newQuantity).subscribe({
          next: () => {
            this.alertService.showSuccess('Quantity updated in cart');
            this.isAddingToCart = false;
          },
          error: () => {
            this.alertService.showError('Error updating cart');
            this.isAddingToCart = false;
          }
        });
      } else {
        this.cartService.addToCart(this.product.id, 1, this.product.price).subscribe({
          next: () => {
            this.alertService.showSuccess('Item added to cart');
            this.isAddingToCart = false;
          },
          error: () => {
            this.alertService.showError('Error adding item to cart');
            this.isAddingToCart = false;
          }
        });
      }
    });
  }
}
