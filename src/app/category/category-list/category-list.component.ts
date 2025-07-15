import { Component, OnInit } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { CategoryAddEditComponent } from '../category-add-edit/category-add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation/delete-confirmation.component';
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-category-list',
  imports: [CategoryCardComponent, CommonModule, CategoryAddEditComponent, ReactiveFormsModule, DeleteConfirmationComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  isLoading = true;
  showAddModal: boolean = false;
  categories: Category[] = [];
  editCategory: Category | null = null;

  //Delete Modal Properties
  showDeleteModal = false;
  categoryToDelete: { id: string, name: string } | null = null;
  isDeleting = false;

  constructor(private categoryService: CategoryService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = response.result || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.showError(error.statusText)
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.editCategory = null;
  }

  onEditCategory(category: Category): void {
    this.editCategory = category;
    this.showAddModal = true;
  }

  onDeleteCategory(categoryInfo: { id: string, name: string }): void {
    this.categoryToDelete = categoryInfo;
    this.showDeleteModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onCategoryAdded(newCategory : Category): void {
    const index = this.categories.findIndex(c => c.id === newCategory.id);

    if (index !== -1)
      this.categories[index] = newCategory;
    else
      this.categories.push(newCategory);
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.isDeleting = true;
    this.categoryService.deleteCategory(this.categoryToDelete.id.toString()).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.categories = this.categories.filter(cat => cat.id.toString() !== this.categoryToDelete!.id.toString());
          this.closeDeleteModal();

          this.alertService.showSuccess("Category Deleted Successfully");
        } else
          this.alertService.showError(response.errorMessage ?? "Failed to delete category");

        this.isDeleting = false;
      },
      error: (error) => {
        this.alertService.showError(error.statusText);
        this.isDeleting = false;
      }
    });
  }

  cancelDelete(): void {
    this.closeDeleteModal();
  }

  private closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
    this.isDeleting = false;
  }
}
