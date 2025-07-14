import { Component, OnInit } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import Swal from 'sweetalert2';
import { CategoryAddEditComponent } from '../category-add-edit/category-add-edit.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-list',
  imports: [CategoryCardComponent, CommonModule, CategoryAddEditComponent, ReactiveFormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  isLoading = true;
  showAddModal: boolean = false;
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

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
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.statusText,
          confirmButtonColor: '#d33'
        });
        this.isLoading = false;
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onCategoryAdded(newCategory : Category): void {
    this.categories.push(newCategory);;
  }
}
