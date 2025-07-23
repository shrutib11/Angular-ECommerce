import { TestBed } from '@angular/core/testing';

import { HashidsService } from './hashids.service';

describe('HashidsService', () => {
  let service: HashidsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashidsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
