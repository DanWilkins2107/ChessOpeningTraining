import { useState } from 'react';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { useAnimatePieces } from '../../../elements/useAnimatePieces';
import { supabase } from '../../../supabase';
import './AnimatePiecesToggle.css';

export function AnimatePiecesToggle() {
  const setting = useAnimatePieces();
  const [chosen, setChosen] = useState<boolean>();
  const [saveFailed, setSaveFailed] = useState(false);

  async function save(animatePieces: boolean) {
    setChosen(animatePieces);
    setSaveFailed(false);
    const { error } = await supabase
      .from('profiles')
      .upsert({ animate_pieces: animatePieces });
    if (error) {
      setChosen(!animatePieces);
      setSaveFailed(true);
    }
  }

  return (
    <div className="animate-pieces">
      <label className="animate-pieces-label">
        <input
          type="checkbox"
          checked={chosen ?? setting.animatePieces}
          disabled={setting.status !== 'loaded'}
          onChange={(event) => save(event.target.checked)}
        />
        Animate pieces
      </label>
      {setting.status === 'failed' && (
        <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>
      )}
      {saveFailed && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
    </div>
  );
}
