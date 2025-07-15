import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent {
  @Input() user: any ;
  @Output() showUserEditModal = new EventEmitter<UserModel>();
  users: UserModel[] = [];
  ngOnInit(): void {}
  constructor(private userService: UserService) { }

  getUserImageUrl(path: string): string {
      const fileName = path.split('/').pop();
      return `${environment.baseUrl}/user-uploads/${fileName}`;
    }

    getInitials(firstName: string, lastName: string): string {
      if (!firstName || !lastName) return '';
      return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    }

    EditUser(user: UserModel): void {
      console.log(user);
      this.showUserEditModal.emit(user);
    }
}
