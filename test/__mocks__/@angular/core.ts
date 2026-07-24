/**
 * Minimal Angular stub for Vitest.
 *
 * We test component classes as plain TypeScript — decorators are no-ops,
 * inputs are just properties. This avoids pulling in Angular's ESM-only
 * build (which requires rxjs@6 bare-directory imports incompatible with
 * Node's native ESM resolver).
 */

// Decorator factories that return no-op decorators
export const Component =
  (_opts?: unknown) =>
  (_target: unknown): void => {};

export const Input =
  (_opts?: unknown) =>
  (_target: unknown, _key?: string): void => {};

export const NgModule =
  (_opts?: unknown) =>
  (_target: unknown): void => {};

export const Injectable =
  (_opts?: unknown) =>
  (_target: unknown): void => {};

export const Directive =
  (_opts?: unknown) =>
  (_target: unknown): void => {};

export const Pipe =
  (_opts?: unknown) =>
  (_target: unknown): void => {};
