const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Made once, so the board reads the same settled promise on every render.
export const START_POSITION = Promise.resolve(START_FEN);
