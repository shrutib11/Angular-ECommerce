import { Component, OnInit} from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { ProductAddEditComponent } from '../product-add-edit/product-add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../shared/alert/alert.service';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation/delete-confirmation.component';
import { HashidsService } from '../../services/hashids.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, CommonModule, RouterModule,ProductAddEditComponent,ReactiveFormsModule, DeleteConfirmationComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  isLoading = true;
  products: Product[] = [];
  receivedCategory: Category | null = null;
  showAddEditModal = false;
  receivedProduct: Product | null = null;
  receivedCategoryId: number | null = null;

   //Delete Modal Properties
   showDeleteModal = false;
   productToDelete: { id: string, name: string } | null = null;
   isDeleting = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private hashidsService: HashidsService
  ) {}

  ngOnInit(): void {
    const hashedId = this.route.snapshot.paramMap.get('id') || '';
    const categoryId = this.hashidsService.decode(hashedId);

    if (categoryId) {
      this.fetchCategoryDetails(categoryId);
      this.fetchProductsByCategory(categoryId);
      this.receivedCategoryId = categoryId;
    } else {
      this.fetchAllProducts();
    }
  }

  fetchCategoryDetails(categoryId: number): void {
    const cached = localStorage.getItem('category-' + categoryId);
    if (cached) {
      this.receivedCategory = JSON.parse(cached);
    } else {
      this.categoryService.getCategoryById(categoryId.toString()).subscribe({
        next: (response) => {
          this.receivedCategory = response.result;
          localStorage.setItem('category-' + categoryId, JSON.stringify(response.result));
        },
        error: (err) => {
          this.alertService.showError(err?.error?.errorMessage || 'Failed to load category details.');
        }
      });
    }
  }

  fetchProductsByCategory(categoryId: number): void {
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (response) => {
        this.products = response.result;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.showError(err?.error?.errorMessage || 'Failed to load products for this category.');
      }
    });
  }

  fetchAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        this.products = response.result;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.showError(err?.error?.errorMessage || 'Failed to load products.');
      }
    });
  }

  getCategoryImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `${environment.baseUrl}/category-uploads/${fileName}`;
  }

  openAddEditModal(): void {
    this.showAddEditModal = true;
    this.receivedProduct = null;
  }

  closeAddEditModal(): void {
    this.showAddEditModal = false;
    this.receivedProduct = null;
  }

  onProductAddEdit(newProduct : Product): void {
    const index = this.products.findIndex(p => p.id === newProduct.id);

    if (index !== -1) {
      this.products[index] = newProduct;
    } else {
      this.products.push(newProduct);
    }
  }

  onEditProduct(product: Product): void {
    this.receivedProduct = product;
    this.showAddEditModal = true;
  }

  onDeleteProduct(productInfo: { id: string, name: string }): void {
    this.productToDelete = productInfo;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.isDeleting = true;
    this.productService.deleteProduct(parseInt(this.productToDelete.id)).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.products = this.products.filter(prod => prod.id.toString() !== this.productToDelete!.id.toString());
          this.closeDeleteModal();

          this.alertService.showSuccess("Product Deleted Successfully");
        }
        this.isDeleting = false;
      },
      error: (err) => {
        this.alertService.showError(err.error.errorMessage || 'Failed to delete product.');
        this.isDeleting = false;
      }
    });
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
    this.isDeleting = false;
  }



}
