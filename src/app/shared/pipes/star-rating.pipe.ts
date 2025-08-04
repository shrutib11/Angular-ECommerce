import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'starRating'
})
export class StarRatingPipe implements PipeTransform {
  transform(rating: number): string[] {
    const stars: string[] = [];

    for (let i = 1; i <= 5; i++) {
      const diff = rating - (i - 1);

      if (diff >= 1) {
        stars.push('full');
      } else if (diff >= 0.25 && diff < 0.75) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  }
}