import { Component, Input } from '@angular/core';
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
  users: UserModel[] = [];
  ngOnInit(): void {
    console.log(this.user);
   }
  constructor(private userService: UserService) { }

  getUserImageUrl(path: string): string {
      const fileName = path.split('/').pop();
      console.log(fileName)
      return `${environment.baseUrl}/user-uploads/${fileName}`;
    }

    getInitials(firstName: string, lastName: string): string {
      if (!firstName || !lastName) return '';
      return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
    }
}
