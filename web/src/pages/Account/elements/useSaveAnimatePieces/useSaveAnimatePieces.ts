import { useRef, useState } from 'react';
import { supabase } from '../../../../supabase';

const SAVE_DELAY_MS = 500;

export function useSaveAnimatePieces(loaded: boolean | undefined) {
  const [chosen, setChosen] = useState<boolean>();
  const [saveFailed, setSaveFailed] = useState(false);
  const saved = useRef<boolean>(undefined);
  const latest = useRef<boolean>(undefined);
  const sending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function choose(animatePieces: boolean) {
    saved.current ??= loaded;
    latest.current = animatePieces;
    setChosen(animatePieces);
    setSaveFailed(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(saveLatest, SAVE_DELAY_MS);
  }

  // One save at a time, so they land in order. A choice made while one is in
  // flight is picked up when it returns.
  async function saveLatest() {
    if (sending.current) return;
    sending.current = true;
    while (latest.current !== saved.current) {
      const animatePieces = latest.current;
      const { error } = await supabase
        .from('profiles')
        .upsert({ animate_pieces: animatePieces });
      if (error) {
        setChosen(saved.current);
        setSaveFailed(true);
        break;
      }
      saved.current = animatePieces;
    }
    sending.current = false;
  }

  return { animatePieces: chosen ?? loaded, choose, saveFailed };
}
