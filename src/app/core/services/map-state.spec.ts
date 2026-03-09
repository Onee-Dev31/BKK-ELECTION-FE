import { TestBed } from '@angular/core/testing';

import { MapState } from './map-state';

describe('MapState', () => {
  let service: MapState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
