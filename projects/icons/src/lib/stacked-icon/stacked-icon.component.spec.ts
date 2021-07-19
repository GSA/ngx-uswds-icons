import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedIconComponent } from './stacked-icon.component';

describe('StackedIconComponent', () => {
  let component: StackedIconComponent;
  let fixture: ComponentFixture<StackedIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StackedIconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StackedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
