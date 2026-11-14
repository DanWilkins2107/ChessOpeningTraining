import { PIECES } from '../../../../shared/pieces/pieces.constants';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './PawnTile.css';

export function PawnTile({ side }: { side: RepertoireMoveTree['side'] }) {
  const pawn = PIECES[side === 'white' ? 'P' : 'p'];
  return (
    <span className="pawn-tile">
      <img className="pawn-tile-icon" src={pawn.image} alt={pawn.name} />
    </span>
  );
}
