import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  imports: [CommonModule],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.css',
  standalone: true
})
export class DeleteConfirmationComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Confirm Delete';
  @Input() message : string = 'Are you sure you want to delete this item?';
  @Input() itemName: string = '';
  @Input() isLoading: boolean = false;
  @Input() deleteButtonText: string = 'Delete';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    if (!this.isLoading) {
      this.confirmed.emit();
    }
  }

  onCancel() {
    if (!this.isLoading) {
      this.cancelled.emit();
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget && !this.isLoading) {
      this.onCancel();
    }
  }
}
