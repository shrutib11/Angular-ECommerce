import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: number | string, currencySymbol:string = '₹'): string {
    if (value == null) return '';



    return `demo}`;
  }

}

