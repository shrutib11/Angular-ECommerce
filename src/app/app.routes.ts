import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { HomeComponent } from './home/home/home.component';
import { UserListComponent } from './user/user-list/user-list.component';
// import { UserComponent } from './User/user/user.component';

export const routes: Routes = [
  { path: '', component:  HomeComponent},
  { path: 'categories', component: CategoryListComponent },
  { path: 'users', component: UserListComponent}
];
