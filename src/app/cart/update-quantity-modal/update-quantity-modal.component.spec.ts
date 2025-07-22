import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateQuantityModalComponent } from './update-quantity-modal.component';

describe('UpdateQuantityModalComponent', () => {
  let component: UpdateQuantityModalComponent;
  let fixture: ComponentFixture<UpdateQuantityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateQuantityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateQuantityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
