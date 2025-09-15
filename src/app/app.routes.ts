import { Routes } from '@angular/router';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { HomeComponent } from './home/home/home.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { ProductDetailComponent } from './product/product-detail/product-detail.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { UnauthorizedComponent } from './shared/pages/unauthorized/unauthorized.component';
import { authRedirectGuard } from './guards/auth-redirect.guard';
import { LoginRedirectComponent } from './shared/login-redirect/login-redirect.component';

export const routes: Routes = [
  {
    path: '',
    component:  HomeComponent
  },
  {
    path: 'categories',
    component: CategoryListComponent
  },
  {
    path: 'users',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./user/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'login',
    component: LoginRedirectComponent,
    data: { noPadding: true }
  },
  {
    path: 'user/reset-password/:email',
    component: ResetPasswordComponent,
    data: { noPadding: true }
  },
  {
    path: 'cart',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./cart/shopping-cart/shopping-cart.component').then(m => m.ShoppingCartComponent)
  },
  {
    path: 'account',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'products',
    component: ProductListComponent
  },
  {
    path: 'products/by-category/:id',
    component: ProductListComponent
  },
  {
    path: 'products/details/:id',
    component: ProductDetailComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: 'reviews/:id',
    canActivate: [authRedirectGuard],
    loadComponent: () => import('./reviews/customer-reviews-page/customer-reviews-page.component').then(m => m.CustomerReviewsPageComponent)
  },
];
