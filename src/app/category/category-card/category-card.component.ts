import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { RouterModule } from '@angular/router';
import { ComponentCommunicationService } from '../../services/component-communication.service';
import { SessionService } from '../../services/session.service';
import Hashids from 'hashids';

@Component({
  selector: 'app-category-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css'
})
export class CategoryCardComponent implements OnInit {
  @Input() category: any;
  hover = false;
  @Output() editClicked = new EventEmitter<Category>();
  @Output() deleteClicked = new EventEmitter<{ id: string, name: string }>();
  isAdmin: boolean = false;
  constructor(private communicationService: ComponentCommunicationService,
    private sessionService: SessionService) { }

    private readonly hashids = new Hashids(environment.secretSalt, 8);

    get hashedCategoryId(): string {
      return this.hashids.encode(this.category.id);
    }

  ngOnInit(): void {
    this.communicationService.isAdmin$.subscribe(show => {
      this.isAdmin = show;
    })
    if (this.sessionService.getUserRole().toLocaleLowerCase() == 'admin') {
      this.isAdmin = true;
    }
  }

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
