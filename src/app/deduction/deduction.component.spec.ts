import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionComponent } from './deduction.component';

describe('DeductionComponent', () => {
  let component: DeductionComponent;
  let fixture: ComponentFixture<DeductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
