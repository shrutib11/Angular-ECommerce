import { Injectable } from '@angular/core';
import Hashids from 'hashids';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HashidsService {
  private hashids: Hashids;

  constructor() {
    this.hashids = new Hashids(environment.secretSalt, 8);
  }

  decode(hash: string): number | null {
    const decoded = this.hashids.decode(hash);
    return Array.isArray(decoded) && decoded.length > 0 ? Number(decoded[0]) : null;
  }

  encode(id: number): string {
    return this.hashids.encode(id);
  }
}
