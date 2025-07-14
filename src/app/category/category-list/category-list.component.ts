import { Component } from '@angular/core';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-list',
  imports: [CategoryCardComponent, CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent {
  isLoading = true;
  categories: Category[] = [];

  constructor(private categoryService : CategoryService){}

  ngOnInit(): void{
    this.categoryService.getAllCategories().subscribe({
      next : (response) => {
        this.categories = response.result;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err,
          confirmButtonColor: '#d33'
        });
      }
    })
  }
}
