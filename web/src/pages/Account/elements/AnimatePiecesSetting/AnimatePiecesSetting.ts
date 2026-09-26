export type AnimatePiecesSetting =
  | { status: 'loading' | 'failed' }
  | { status: 'loaded'; animatePieces: boolean };
