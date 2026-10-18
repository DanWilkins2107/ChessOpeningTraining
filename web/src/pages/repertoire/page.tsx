import { TrainCard } from '../../elements/TrainCard/TrainCard';
import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import './page.css';

export function Repertoire() {
  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <TrainCard daysSinceLastTrained={null} movesTrainedToday={0} />
      <CreateFolderForm onCreated={() => {}} />
      <p className="repertoire-empty">No folders yet</p>
    </section>
  );
}
