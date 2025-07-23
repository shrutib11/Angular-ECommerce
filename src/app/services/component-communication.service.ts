import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {

  private modalSubject = new BehaviorSubject<boolean>(false);
  private navbarSubject = new BehaviorSubject<boolean>(true);
  private adminRoleSubjet = new BehaviorSubject<boolean>(false);
  private loggedInSubject = new BehaviorSubject<boolean>(false);

  showModal$ = this.modalSubject.asObservable();
  showNavbar$ = this.navbarSubject.asObservable();
  isAdmin$ = this.adminRoleSubjet.asObservable();
  isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor() {}

  isLoggedIn(loggedIn : boolean){
    this.loggedInSubject.next(loggedIn);
  }

  userRole(){
    this.adminRoleSubjet.next(false);
  }

  adminRole(){
    this.adminRoleSubjet.next(true);
  }

  openModal() {
    this.modalSubject.next(true);
  }

  closeModal() {
    this.modalSubject.next(false);
  }

  showNavbar() {
    this.navbarSubject.next(true);
  }

  hideNavbar() {
    this.navbarSubject.next(false);
  }
}

