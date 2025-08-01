import { Injectable } from '@angular/core';
import { session } from '../models/session.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private storageKey = "Ecomm-session";
  private cartId: number | null = null;
  private sessionReadySubject = new BehaviorSubject<boolean>(false);
  public sessionReady$ = this.sessionReadySubject.asObservable();

  initializeSession() {
    const id = this.getCartId();
    if (id) {
      this.cartId = id;
      this.sessionReadySubject.next(true);
    }
  }

  private getSession(): session {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) as session : { userId: 0, email: '', cartId: 0 , role: ''};
  }

  setUserRole(role : string){
    const session = this.getSession();
    session.role = role;
    this.saveSession(session);
  }

  getUserRole(){
    return this.getSession().role;
  }

  private saveSession(session: session): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  setUserId(userId: number): void {
    const session = this.getSession();
    session.userId = userId;
    this.saveSession(session);
  }

  getUserId(): number {
    return this.getSession().userId;
  }

  setEmail(email: string): void {
    const session = this.getSession();
    session.email = email;
    this.saveSession(session);
  }

  getEmail(): string {
    return this.getSession().email;
  }

  setCartId(cartId: number): void {
    const session = this.getSession();
    session.cartId = cartId;
    this.saveSession(session);
  }

  getCartId(): number {
    return this.getSession().cartId;
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  public markSessionReady(): void {
    this.sessionReadySubject.next(true);
  }
}
