// fallow-ignore-file unused-file -- 6b485352 2026-11-15 landed ahead of the repertoire page, its first consumer (a6c2d850).
import { Link } from 'react-router-dom';
import './TrainCard.css';

type TrainCardProps = {
  daysSinceLastTrained: number | null;
  movesTrainedToday: number;
  trainPath: string;
};

function lastTrainedText(days: number | null) {
  if (days === null) return 'Not trained yet';
  if (days === 0) return 'Last trained today';
  if (days === 1) return 'Last trained yesterday';
  return `Last trained ${days} days ago`;
}

export function TrainCard({
  daysSinceLastTrained,
  movesTrainedToday,
  trainPath,
}: TrainCardProps) {
  return (
    <section className="train-card" aria-labelledby="train-card-heading">
      <h2 id="train-card-heading" className="train-card-heading">
        Train
      </h2>
      <p className="train-card-stat">{lastTrainedText(daysSinceLastTrained)}</p>
      <p className="train-card-stat">
        {movesTrainedToday === 1
          ? '1 move trained today'
          : `${movesTrainedToday} moves trained today`}
      </p>
      <Link to={trainPath} className="train-card-action">
        Start training
      </Link>
    </section>
  );
}
