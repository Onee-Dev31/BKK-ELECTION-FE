import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewer } from './map-viewer';

describe('MapViewer', () => {
  let component: MapViewer;
  let fixture: ComponentFixture<MapViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
