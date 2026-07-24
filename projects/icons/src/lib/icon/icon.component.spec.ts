import { describe, it, expect, beforeEach } from 'vitest';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IconComponent;

  beforeEach(() => {
    component = new IconComponent();
  });

  it('has expected input defaults', () => {
    expect(component.icon).toBe('');
    expect(component.rotate).toBe(0);
    expect(component.size).toBe('lg');
  });

  describe('skew setter', () => {
    it('sets skewX from first element and defaults skewY to 0 when one element provided', () => {
      component.skew = [30];
      expect(component.skewX).toBe(30);
      expect(component.skewY).toBe(0);
    });

    it('sets both skewX and skewY when two elements provided', () => {
      component.skew = [15, 45];
      expect(component.skewX).toBe(15);
      expect(component.skewY).toBe(45);
    });
  });

  describe('skewClass getter', () => {
    it('returns skew-{x}-{y} when skewX is non-zero', () => {
      component.skew = [10, 0];
      expect(component.skewClass).toBe('skew-10-0');
    });

    it('returns skew-{x}-{y} when skewY is non-zero', () => {
      component.skew = [0, 20];
      expect(component.skewClass).toBe('skew-0-20');
    });

    it('returns empty string when both skewX and skewY are zero', () => {
      expect(component.skewClass).toBe('');
    });
  });

  describe('classes setter', () => {
    it('joins array into iconClasses string when truthy array provided', () => {
      component.classes = ['foo', 'bar'];
      expect(component.iconClasses).toBe('foo, bar');
    });

    it('leaves iconClasses unchanged when falsy value provided', () => {
      component.classes = ['initial'];
      component.classes = null as unknown as string[];
      expect(component.iconClasses).toBe('initial');
    });
  });
});
