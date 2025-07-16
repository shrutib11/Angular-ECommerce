import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  isEditing = false;

  originalValues = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: '123 Main Street, Anytown, State 12345',
    pinCode: '123456'
  };

  currentValues = { ...this.originalValues };

  enableEdit() {
    this.isEditing = true;
  }

  saveChanges() {
    this.originalValues = { ...this.currentValues };
    this.isEditing = false;
    // Add your save API call here
  }

  cancelEdit() {
    this.currentValues = { ...this.originalValues };
    this.isEditing = false;
  }
}