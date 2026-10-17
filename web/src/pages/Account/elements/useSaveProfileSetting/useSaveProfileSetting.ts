import { useRef, useState } from 'react';
import type { ProfileSetting } from '../useProfileSettings/useProfileSettings.constants';
import { useUpdateProfileSetting } from '../useUpdateProfileSetting/useUpdateProfileSetting';

const SAVE_DELAY_MS = 500;

type SaveOutcome = 'saved' | 'failed';

export function useSaveProfileSetting(
  setting: ProfileSetting,
  loaded: boolean,
) {
  const update = useUpdateProfileSetting(setting);
  const [chosen, setChosen] = useState<boolean>();
  const [outcome, setOutcome] = useState<SaveOutcome>();
  const saved = useRef<boolean>(undefined);
  const latest = useRef<boolean>(undefined);
  const sending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function choose(value: boolean) {
    saved.current ??= loaded;
    latest.current = value;
    setChosen(value);
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
      const value = latest.current!;
      try {
        await update(value);
      } catch {
        setChosen(saved.current);
        result = 'failed';
        break;
      }
      saved.current = value;
      result = 'saved';
    }
    setOutcome(result);
    sending.current = false;
  }

  return { value: chosen ?? loaded, choose, outcome };
}
