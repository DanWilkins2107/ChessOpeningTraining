import { expect, it } from 'vitest';
import { duplicateDeclarations, testSources } from './duplicateHelperGate';

const scanned = testSources();

it('declares every top-level test helper name in only one file', () => {
  expect(Object.keys(scanned).length).toBeGreaterThan(0);
  expect(duplicateDeclarations(scanned)).toEqual([]);
});
