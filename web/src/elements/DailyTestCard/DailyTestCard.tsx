// fallow-ignore-file unused-file -- 57b95f1c 2026-11-15 landed ahead of the repertoire page, its first consumer.
import { Link } from 'react-router-dom';
import rook from '../../shared/pieces/bR.svg';
import { DAILY_TEST_ROUTE_PATH } from '../../shared/routes/routes.constants';
import './DailyTestCard.css';

type DailyTestCardProps =
  { status: 'not-started' | 'in-progress' } | { status: 'done'; score: number };

const STATUS_TEXT = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
};

const ACTION_TEXT = {
  'not-started': 'Start test',
  'in-progress': 'Resume test',
  done: 'View result',
};

export function DailyTestCard(props: DailyTestCardProps) {
  return (
    <section className="daily-test-card">
      <img src={rook} alt="" className="daily-test-card-icon" />
      <h2 className="daily-test-card-heading">Daily test</h2>
      <p className="daily-test-card-status">
        {STATUS_TEXT[props.status]}
        {props.status === 'done' && ` · ${props.score}%`}
      </p>
      <Link to={DAILY_TEST_ROUTE_PATH} className="daily-test-card-action">
        {ACTION_TEXT[props.status]}
      </Link>
    </section>
  );
}
