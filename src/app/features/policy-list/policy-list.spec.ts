import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyList } from './policy-list';

describe('PolicyList', () => {
  let component: PolicyList;
  let fixture: ComponentFixture<PolicyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
