import { PIECES } from '../../../../shared/pieces/pieces.constants';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './PawnTile.css';

export function PawnTile({
  side,
  large = false,
}: {
  side: RepertoireMoveTree['side'];
  large?: boolean;
}) {
  const pawn = PIECES[side === 'white' ? 'P' : 'p'];
  return (
    <span className={large ? 'pawn-tile pawn-tile-large' : 'pawn-tile'}>
      <img className="pawn-tile-icon" src={pawn.image} alt={pawn.name} />
    </span>
  );
}
