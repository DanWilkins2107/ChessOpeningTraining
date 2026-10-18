import { createElement } from 'react';

export const LOADING = 'Loading things';
export const ERROR = "Couldn't load things";

export const Loading = () => createElement('p', null, LOADING);

export const LoadError = ({ retry }: { retry: () => void }) =>
  createElement('button', { type: 'button', onClick: retry }, ERROR);

// Fails the way content does when its data can't load.
export function Broken(): never {
  throw new Error('Server down');
}
