import { Component, OnInit} from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency.pipe';
import { AlertService } from '../../shared/alert/alert.service';
import { HashidsService } from '../../services/hashids.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule,RouterModule, IndianCurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {

  isLoading = true;
  product: Product = {} as Product;
  category: Category | null = null;


  constructor(
    private hashidsService: HashidsService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const hashedId = this.route.snapshot.paramMap.get('id') || '';
    const productId = this.hashidsService.decode(hashedId);

    if (productId) {
      this.productService.getProductById(+productId).subscribe({
        next: (response) => {
          this.product = response.result;
          this.isLoading = false;
          this.fetchCategory(this.product.categoryId.toString());
        },
        error: (err) => {
          this.isLoading = false;
          this.alertService.showError('Failed to load product details. Please try again later.');
        }
      });
    }
  }

  fetchCategory(categoryId: string): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (response) => {
        this.category = response.result;
      },
      error: (err) => {
        this.alertService.showError('Failed to load category details. Please try again later.');
      }
    });
  }

   getProductImageUrl(path: string): string {
      const fileName = path.split('/').pop();
      return `${environment.baseUrl}/product-uploads/${fileName}`;
    }
}

