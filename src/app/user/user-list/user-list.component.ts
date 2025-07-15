import { Component, Input, input } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { UserCardComponent } from '../user-card/user-card.component';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from "../user-add-edit/user-add-edit.component";

@Component({
  selector: 'app-user-list',
  imports: [UserCardComponent, CommonModule, UserAddEditComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
users: UserModel[] = [];
selectedUser!: UserModel;
@Input() showModal: boolean = false;
  constructor(private userService: UserService) { }

    showEditModal(user: UserModel): void {
      this.selectedUser = user;
      this.showModal = true;
    }
  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.result || [];
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.statusText,
          confirmButtonColor: '#d33'
        });
      }
    })
  }
}
