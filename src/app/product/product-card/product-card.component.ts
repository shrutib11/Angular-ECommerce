import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterModule,CommonModule,IndianCurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {

  @Input() product: any;
  hover = false;
  @Output() editClicked = new EventEmitter<Product>();
  @Output() deleteClicked = new EventEmitter<{ id: string, name: string }>();

  constructor() { }

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

}
