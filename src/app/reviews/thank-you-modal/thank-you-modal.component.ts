import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-thank-you-modal',
  imports: [CommonModule],
  templateUrl: './thank-you-modal.component.html',
  styleUrl: './thank-you-modal.component.css'
})
export class ThankYouModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
    this.onClose();
  }

  onOverlayClick(event: Event): void {
    this.onClose();
  }
}
