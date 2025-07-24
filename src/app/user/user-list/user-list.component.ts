import { Component, Input, input } from '@angular/core';
import { UserModel } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { UserCardComponent } from '../user-card/user-card.component';
import { CommonModule } from '@angular/common';
import { UserAddEditComponent } from "../user-add-edit/user-add-edit.component";
import { AlertService } from '../../shared/alert/alert.service';

@Component({
  selector: 'app-user-list',
  imports: [UserCardComponent, CommonModule, UserAddEditComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})


export class UserListComponent {
isLoading = true;
users: UserModel[] = [];
selectedUser!: UserModel;
@Input() showModal: boolean = false;
@Input() isUpsertCompleted: boolean = false;
  constructor(private userService: UserService,private alertService : AlertService) { }

  showEditModal(user: UserModel): void {
    this.selectedUser = user;
    this.showModal = true;
  }

  onUpsertCompleted(upsertCompleted: boolean) {
    this.isUpsertCompleted = true;
    this.showModal = false;
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.result || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.alertService.showError('Failed to load users');
        this.isLoading = false;
      }
    })
  }

}
