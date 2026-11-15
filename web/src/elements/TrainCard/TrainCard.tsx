// fallow-ignore-file unused-file -- 54cc6649 2026-11-29 landed ahead of the repertoire page, its first consumer.
import { Link } from 'react-router-dom';
import knight from '../../shared/pieces/bN.svg';
import { TRAIN_ROUTE_PATH } from './TrainCard.constants';
import './TrainCard.css';

type TrainCardProps = {
  daysSinceLastTrained: number | null;
  movesTrainedToday: number;
};

function lastTrainedText(days: number | null) {
  if (days === null) return 'Not trained yet';
  if (days === 0) return 'Last trained today';
  if (days === 1) return 'Last trained yesterday';
  return `Last trained ${days} days ago`;
}

function movesTrainedText(moves: number) {
  return `${moves} ${moves === 1 ? 'move' : 'moves'} trained today`;
}

export function TrainCard({
  daysSinceLastTrained,
  movesTrainedToday,
}: TrainCardProps) {
  return (
    <section className="train-card">
      <img src={knight} alt="" className="train-card-piece" />
      <h2 className="train-card-heading">Train</h2>
      <p className="train-card-stat">{lastTrainedText(daysSinceLastTrained)}</p>
      <p className="train-card-stat">{movesTrainedText(movesTrainedToday)}</p>
      <Link to={TRAIN_ROUTE_PATH} className="train-card-action">
        Start training
      </Link>
    </section>
  );
}
