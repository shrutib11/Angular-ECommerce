import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { HomeComponent } from './home/home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';
import { ShoppingCartComponent } from './cart/shopping-cart/shopping-cart.component';

export const routes: Routes = [
  { path: '', component:  HomeComponent},
  { path: 'categories', component: CategoryListComponent },
  { path: 'users', component: UserListComponent },
  { path: 'cart', component: ShoppingCartComponent},  { path: 'account', component: ProfileComponent},
  { path: 'products', component: ProductListComponent },
  { path: 'products/by-category/:id', component: ProductListComponent },
  { path: 'products/details/:id', component: ProductDetailComponent }
];
