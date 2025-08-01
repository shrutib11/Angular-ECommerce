import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SessionService } from '../../services/session.service';
import { CartService } from '../../services/cart.service';
import { AlertService } from '../../shared/alert/alert.service';
import Hashids from 'hashids';

@Component({
  selector: 'app-product-card',
  imports: [RouterModule, CommonModule, IndianCurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product: any;
  isAdmin: boolean = false;
  hover = false;
  isAddingToCart = false;
  private readonly hashids = new Hashids(environment.secretSalt, 8);
  isLoggedIn: boolean = false;
  @Output() editClicked = new EventEmitter<Product>();
  @Output() deleteClicked = new EventEmitter<{ id: string, name: string }>();

  constructor(private communicationService: ComponentCommunicationService, private route: Router, private sessionService: SessionService, private cartService: CartService, private alertService: AlertService) { }

  getProductImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `${environment.baseUrl}/product-uploads/${fileName}`;
  }

  get hashedProductId(): string {
    return this.hashids.encode(this.product.id);
  }

  onEditClick() {
    this.editClicked.emit(this.product);
  }

  ngOnInit() {
    this.communicationService.isAdmin$.subscribe(show => {
      this.isAdmin = show
    })
    if (this.sessionService.getUserId() != 0) {
      this.isLoggedIn = true
    }
    if (this.sessionService.getUserRole().toLocaleLowerCase() == 'admin') {
      this.isAdmin = true;
    }
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

    this.cartService.addOrUpdateCartItem(this.product, this.isLoggedIn).subscribe({
      next: () => {
        this.alertService.showSuccess('Item added/updated in cart');
        this.isAddingToCart = false;
      },
      error: (err) => {
        this.alertService.showError('Error adding to cart');
        this.isAddingToCart = false;
      }
    });
  }
}
