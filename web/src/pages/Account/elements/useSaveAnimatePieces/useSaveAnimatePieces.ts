import { useRef, useState } from 'react';
import { useUpdateAnimatePieces } from '../useUpdateAnimatePieces/useUpdateAnimatePieces';

const SAVE_DELAY_MS = 500;

type SaveOutcome = 'saved' | 'failed';

export function useSaveAnimatePieces(loaded: boolean | undefined) {
  const update = useUpdateAnimatePieces();
  const [chosen, setChosen] = useState<boolean>();
  const [outcome, setOutcome] = useState<SaveOutcome>();
  const saved = useRef<boolean>(undefined);
  const latest = useRef<boolean>(undefined);
  const sending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function choose(animatePieces: boolean) {
    saved.current ??= loaded;
    latest.current = animatePieces;
    setChosen(animatePieces);
    setOutcome(undefined);
    clearTimeout(timer.current);
    timer.current = setTimeout(saveLatest, SAVE_DELAY_MS);
  }

  // One save at a time, so they land in order. A choice made while one is in
  // flight is picked up when it returns.
  async function saveLatest() {
    if (sending.current) return;
    sending.current = true;
    let result: SaveOutcome | undefined;
    while (latest.current !== saved.current) {
      const animatePieces = latest.current!;
      try {
        await update(animatePieces);
      } catch {
        setChosen(saved.current);
        result = 'failed';
        break;
      }
      saved.current = animatePieces;
      result = 'saved';
    }
    setOutcome(result);
    sending.current = false;
  }

  return { animatePieces: chosen ?? loaded, choose, outcome };
}
