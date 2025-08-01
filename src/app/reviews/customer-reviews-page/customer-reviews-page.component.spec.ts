import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerReviewsPageComponent } from './customer-reviews-page.component';

describe('CustomerReviewsPageComponent', () => {
  let component: CustomerReviewsPageComponent;
  let fixture: ComponentFixture<CustomerReviewsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerReviewsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerReviewsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
