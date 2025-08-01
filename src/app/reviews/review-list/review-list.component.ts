import { Component, Input } from '@angular/core';
import { ReviewItem } from '../../models/review-item.model';
import { ReviewItemComponent } from '../review-item/review-item.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-list',
  imports: [ReviewItemComponent, CommonModule, FormsModule],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent {
  @Input() reviews: ReviewItem[] = [];

  filteredReviews: ReviewItem[] = [];
  selectedRating = 'all';
  sortBy = 'recent';
  currentPage = 1;
  itemsPerPage = 10;

  ngOnInit(): void {
    this.filteredReviews = [...this.reviews];
  }

  filterByRating(rating: string): void {
    this.selectedRating = rating;
    this.currentPage = 1;

    if (rating === 'all') {
      this.filteredReviews = [...this.reviews];
    } else {
      const ratingNumber = parseInt(rating);
      this.filteredReviews = this.reviews.filter(review =>
        Math.floor(review.rating) === ratingNumber
      );
    }

    this.applySorting();
  }

  sortReviews(sortOption: string): void {
    this.sortBy = sortOption;
    this.applySorting();
  }

  private applySorting(): void {
    switch (this.sortBy) {
      case 'recent':
        this.filteredReviews.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'oldest':
        this.filteredReviews.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case 'highest':
        this.filteredReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        this.filteredReviews.sort((a, b) => a.rating - b.rating);
        break;
    }
  }

  getPaginatedReviews(): ReviewItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredReviews.slice(startIndex, endIndex);
  }

  // getTotalPages(): number {
  //   return Math.ceil(this.filteredReviews.length / this.itemsPerPage);
  // }

  // changePage(page: number): void {
  //   if (page >= 1 && page <= this.getTotalPages()) {
  //     this.currentPage = page;
  //   }
  // }

  // getPageNumbers(): number[] {
  //   const totalPages = this.getTotalPages();
  //   const pages = [];

  //   if (totalPages <= 5) {
  //     for (let i = 1; i <= totalPages; i++) {
  //       pages.push(i);
  //     }
  //   } else {
  //     if (this.currentPage <= 3) {
  //       pages.push(1, 2, 3, 4, 5);
  //     } else if (this.currentPage >= totalPages - 2) {
  //       for (let i = totalPages - 4; i <= totalPages; i++) {
  //         pages.push(i);
  //       }
  //     } else {
  //       for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
  //         pages.push(i);
  //       }
  //     }
  //   }

  //   return pages;
  // }
}
