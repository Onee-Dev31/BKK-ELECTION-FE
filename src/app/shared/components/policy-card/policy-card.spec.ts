import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCard } from './policy-card';

describe('PolicyCard', () => {
  let component: PolicyCard;
  let fixture: ComponentFixture<PolicyCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
