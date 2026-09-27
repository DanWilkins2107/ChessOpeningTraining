import { useState } from 'react';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import type { AnimatePiecesSetting } from '../AnimatePiecesSetting/AnimatePiecesSetting';
import { supabase } from '../../../../supabase';
import './AnimatePiecesToggle.css';

type AnimatePiecesToggleProps = { setting: AnimatePiecesSetting };

export function AnimatePiecesToggle({ setting }: AnimatePiecesToggleProps) {
  const [chosen, setChosen] = useState<boolean>();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const loading = setting.status === 'loading';

  async function save(animatePieces: boolean) {
    setChosen(animatePieces);
    setSaving(true);
    setSaveFailed(false);
    const { error } = await supabase
      .from('profiles')
      .upsert({ animate_pieces: animatePieces });
    setSaving(false);
    if (error) {
      setChosen(!animatePieces);
      setSaveFailed(true);
    }
  }

  return (
    <div className="animate-pieces">
      <div className="animate-pieces-row">
        <label className="animate-pieces-label">
          <input
            type="checkbox"
            checked={chosen ?? setting.animatePieces ?? false}
            disabled={setting.status !== 'loaded' || saving}
            onChange={(event) => save(event.target.checked)}
          />
          Animate pieces
        </label>
        {(loading || saving) && (
          <span
            role="status"
            aria-label={
              loading ? 'Loading your setting' : 'Saving your setting'
            }
            className="animate-pieces-spinner"
          />
        )}
      </div>
      {setting.status === 'failed' && (
        <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>
      )}
      {saveFailed && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
    </div>
  );
}
