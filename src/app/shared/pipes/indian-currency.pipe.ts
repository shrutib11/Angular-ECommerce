import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency'
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: number | string, currencySymbol:string = '₹'): string {
    if (value == null) return '';

    let amount = typeof value === 'number' ? value.toString() : value;
    const [integer, fraction] = amount.split('.');

    let lastThree = integer.slice(-3);
    const otherNumbers = integer.slice(0, -3);

    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }

    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return `${currencySymbol}${formatted}${fraction ? '.' + fraction.padEnd(2, '0') : '.00'}`;
  }

}

