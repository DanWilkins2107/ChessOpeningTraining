import { RepertoireCard } from '../repertoire/elements/RepertoireCard/RepertoireCard';
import { FolderTile } from '../repertoire/elements/FolderTile/FolderTile';
import { PawnTile } from '../repertoire/elements/PawnTile/PawnTile';
import '../repertoire/page.css';

// Prototype only: fake rows so the tiles can be judged in place.
const rows = [
  { kind: 'folder', name: 'Sicilian Defence' },
  { kind: 'folder', name: 'Queen’s Gambit' },
  { kind: 'white', name: 'Italian Game' },
  { kind: 'black', name: 'Caro-Kann' },
] as const;

export function TilesPreview() {
  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <RepertoireCard>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {rows.map((r) => (
            <li
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1rem',
              }}
            >
              {r.kind === 'folder' ? (
                <FolderTile />
              ) : (
                <PawnTile side={r.kind} />
              )}
              <span>{r.name}</span>
            </li>
          ))}
        </ul>
      </RepertoireCard>
    </section>
  );
}
