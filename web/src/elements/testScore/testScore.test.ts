import { expect, it } from 'vitest';
import { testScore, type TestLineResult } from './testScore';

it('weights a split reply 2 against a first full-line move of 1', () => {
  // Given a right first move and a wrong split reply
  const lines: TestLineResult[] = [
    { type: 'full', outcomes: ['right'] },
    { type: 'split', outcomes: ['wrong'] },
  ];

  // When the test is scored
  const score = testScore(lines);

  // Then it is 1 out of 3
  expect(score).toBe(33);
});

it('weights each full-line move 1.05x the one before', () => {
  // Given a full line with its first two moves right and its third wrong
  const lines: TestLineResult[] = [
    { type: 'full', outcomes: ['right', 'right', 'wrong'] },
  ];

  // When the test is scored
  const score = testScore(lines);

  // Then it is 2.05 out of 3.1525
  expect(score).toBe(65);
});

it('weights other-colour moves 0.8x a full line, with the same lateness', () => {
  // Given a right full-line first move and a wrong other-colour second move
  const lines: TestLineResult[] = [
    { type: 'full', outcomes: ['right'] },
    { type: 'otherColour', outcomes: ['right', 'wrong'] },
  ];

  // When the test is scored
  const score = testScore(lines);

  // Then it is 1.8 out of 2.64
  expect(score).toBe(68);
});

it('pools every question across the test rather than averaging lines', () => {
  // Given a perfect three-reply split and a wrong one-reply split
  const lines: TestLineResult[] = [
    { type: 'split', outcomes: ['right', 'right', 'right'] },
    { type: 'split', outcomes: ['wrong'] },
  ];

  // When the test is scored
  const score = testScore(lines);

  // Then it is 6 out of 8, not the mean of 100 and 0
  expect(score).toBe(75);
});

it('leaves unanswered questions out but keeps their place for lateness', () => {
  // Given a full line with an unanswered first move, then wrong and right
  const lines: TestLineResult[] = [
    { type: 'full', outcomes: ['unanswered', 'wrong', 'right'] },
  ];

  // When the test is scored
  const score = testScore(lines);

  // Then it is 1.1025 out of 2.1525
  expect(score).toBe(51);
});

it.each<[string, TestLineResult[]]>([
  ['no lines', []],
  ['nothing answered', [{ type: 'split', outcomes: ['unanswered'] }]],
])('is 100 for %s', (_, lines) => {
  // Given nothing answered
  // When the test is scored
  const score = testScore(lines);

  // Then it is full
  expect(score).toBe(100);
});
