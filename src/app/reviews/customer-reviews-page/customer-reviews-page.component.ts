import { Component } from '@angular/core';
import { ReviewData } from '../../models/reviewData.model';
import { ReviewItem } from '../../models/review-item.model';
import { ActivatedRoute } from '@angular/router';
import { ReviewListComponent } from '../review-list/review-list.component';
import { CustomerReviewsComponent } from '../customer-reviews/customer-reviews.component';

@Component({
  selector: 'app-customer-reviews-page',
  imports: [ReviewListComponent, CustomerReviewsComponent],
  templateUrl: './customer-reviews-page.component.html',
  styleUrl: './customer-reviews-page.component.css'
})
export class CustomerReviewsPageComponent {
  productId: string = '';

  // Sample review data
  reviewData: ReviewData = {
    averageRating: 4.0,
    totalReviews: 16281,
    ratingBreakdown: {
      fiveStar: 50,
      fourStar: 22,
      threeStar: 14,
      twoStar: 5,
      oneStar: 9
    }
  };

  reviews: ReviewItem[] = [
    {
      id: '1',
      customerName: 'Sarah M.',
      customerInitial: 'S',
      rating: 4,
      date: '2025-07-24',
      reviewText: 'Very cute. Easy to assemble. Just have to screw the legs to the desk. Responsible and intelligent design. Sturdy and worth the price. Love it. Balance is good.'
    },
    {
      id: '2',
      customerName: 'John D.',
      customerInitial: 'J',
      rating: 4,
      date: '2025-07-20',
      reviewText: 'Good quality product. Delivery was fast and packaging was excellent. The design is modern and fits perfectly in my office space.'
    },
    {
      id: '3',
      customerName: 'Emily R.',
      customerInitial: 'E',
      rating: 5,
      date: '2025-07-18',
      reviewText: 'Absolutely love this! The quality exceeded my expectations. Easy to set up and looks great. Would definitely recommend to others.'
    },
    {
      id: '4',
      customerName: 'Michael K.',
      customerInitial: 'M',
      rating: 3,
      date: '2025-07-15',
      reviewText: 'Decent product for the price. Assembly took a bit longer than expected but the end result is satisfactory. Good value for money.'
    },
    {
      id: '5',
      customerName: 'Lisa T.',
      customerInitial: 'L',
      rating: 5,
      date: '2025-07-12',
      reviewText: 'Perfect desk for my home office! The quality is amazing and it was so easy to put together. Highly recommend this product.'
    },
    {
      id: '6',
      customerName: 'David W.',
      customerInitial: 'D',
      rating: 4,
      date: '2025-07-10',
      reviewText: 'Great purchase! The desk is sturdy and looks exactly as pictured. Assembly instructions were clear and easy to follow.'
    },
    {
      id: '7',
      customerName: 'Amanda S.',
      customerInitial: 'A',
      rating: 5,
      date: '2025-07-08',
      reviewText: 'Excellent quality and fast shipping. The desk is perfect for my needs and the customer service was outstanding.'
    },
    {
      id: '8',
      customerName: 'Robert H.',
      customerInitial: 'R',
      rating: 3,
      date: '2025-07-05',
      reviewText: 'Good desk overall. Had some minor issues with one of the screws but customer support helped resolve it quickly.'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = params['id'] || '';
    });

    // In a real application, you would fetch review data based on productId
    // this.loadReviewData(this.productId);
  }

  // Method to load review data from service
  private loadReviewData(productId: string): void {
    // this.reviewService.getReviewData(productId).subscribe(data => {
    //   this.reviewData = data.summary;
    //   this.reviews = data.reviews;
    // });
  }

  goBack(): void {
    window.history.back();
  }
}