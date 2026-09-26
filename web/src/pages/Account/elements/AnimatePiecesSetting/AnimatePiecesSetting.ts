export type AnimatePiecesSetting =
  | { status: 'loading' | 'failed'; animatePieces?: never }
  | { status: 'loaded'; animatePieces: boolean };
