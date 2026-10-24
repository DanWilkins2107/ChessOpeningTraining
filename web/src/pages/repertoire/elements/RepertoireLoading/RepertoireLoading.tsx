import { RepertoireCard } from '../RepertoireCard/RepertoireCard';
import './RepertoireLoading.css';

const PLACEHOLDER_ROWS = ['wide', 'medium', 'narrow'];

export function RepertoireLoading() {
  return (
    <div role="status" aria-label="Loading repertoire">
      <RepertoireCard>
        {/* TODO ec057722 2026-11-07: shape these rows like the real repertoire rows once they land. */}
        {PLACEHOLDER_ROWS.map((width) => (
          <div key={width} className="repertoire-loading-row">
            <div className="repertoire-loading-tile" />
            <div
              className={`repertoire-loading-name repertoire-loading-name-${width}`}
            />
          </div>
        ))}
      </RepertoireCard>
    </div>
  );
}
