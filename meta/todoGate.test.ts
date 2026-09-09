import { describe, expect, it } from 'vitest';
import { rottenTodos } from './todoGate';

describe('todo gate', () => {
  it('finds no rotten TODOs in tracked files', () => {
    expect(rottenTodos()).toEqual([]);
  });
});
