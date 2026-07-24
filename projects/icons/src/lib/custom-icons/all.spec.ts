import { describe, it, expect } from 'vitest';
import { allIcons } from './all';

describe('custom-icons barrel integrity', () => {
  const entries = Object.entries(allIcons);

  it('exports 93 custom icons', () => {
    expect(entries.length).toBe(93);
  });

  it('every icon value is a non-empty SVG string', () => {
    for (const [name, svg] of entries) {
      expect(typeof svg, `${name} should be a string`).toBe('string');
      expect((svg as string).trim(), `${name} should not be empty`).not.toBe('');
      expect((svg as string).trimStart(), `${name} should start with <svg or <?xml`).toMatch(/^(<\?xml|<svg)/i);
    }
  });
});
