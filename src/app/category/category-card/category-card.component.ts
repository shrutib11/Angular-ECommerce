import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-card',
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css'
})
export class CategoryCardComponent implements OnInit {
  @Input() category: any;
  hover = false;
  @Output() editClicked = new EventEmitter<Category>();
  @Output() deleteClicked = new EventEmitter<{ id: string, name: string }>();

  ngOnInit(): void { }

  getCategoryImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `${environment.baseUrl}/category-uploads/${fileName}`;
  }

  onEditClick() {
    this.editClicked.emit(this.category);
  }

  onDeleteClick() {
    this.deleteClicked.emit({
      id: this.category.id,
      name: this.category.name
    });
  }
}
