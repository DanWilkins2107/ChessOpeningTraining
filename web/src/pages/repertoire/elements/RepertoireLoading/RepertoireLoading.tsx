import { RepertoireCard } from '../RepertoireCard/RepertoireCard';
import './RepertoireLoading.css';

const PLACEHOLDER_ROWS = 3;

export function RepertoireLoading() {
  return (
    <div role="status" aria-label="Loading repertoire">
      <RepertoireCard>
        {/* TODO 67fc4ba0 2026-12-14: shape these rows like the real repertoire rows once they land. */}
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, row) => (
          <div key={row} className="repertoire-loading-row">
            <div className="repertoire-loading-tile" />
            <div className="repertoire-loading-name" />
          </div>
        ))}
      </RepertoireCard>
    </div>
  );
}
