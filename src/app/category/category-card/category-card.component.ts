import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-card',
  imports: [],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css'
})
export class CategoryCardComponent {
  @Input() category: any;

  getCategoryImageUrl(path: string): string {
    const fileName = path.split('/').pop();
    return `http://localhost:7000/category-uploads/${fileName}`;
  }
}
