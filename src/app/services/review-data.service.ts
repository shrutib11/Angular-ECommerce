import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewDataService {
  private _reviewData: any;

  set reviewData(data: any) {
    this._reviewData = data;
  }

  get reviewData(): any {
    return this._reviewData;
  }
}
