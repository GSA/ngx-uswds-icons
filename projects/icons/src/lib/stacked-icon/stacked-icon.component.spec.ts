import { describe, it, expect, beforeEach } from 'vitest';
import { StackedIconComponent } from './stacked-icon.component';

describe('StackedIconComponent', () => {
  let component: StackedIconComponent;

  beforeEach(() => {
    component = new StackedIconComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accepts a size input', () => {
    component.size = 'sm';
    expect(component.size).toBe('sm');
  });
});
