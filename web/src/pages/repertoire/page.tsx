import { TrainCard } from './elements/TrainCard/TrainCard';
import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import './page.css';

export function Repertoire() {
  return (
    <section className="repertoire">
      <div className="repertoire-cards">
        <TrainCard daysSinceLastTrained={null} movesTrainedToday={0} />
      </div>
      <h1>Repertoire</h1>
      <CreateFolderForm onCreated={() => {}} />
      <p className="repertoire-empty">No folders yet</p>
    </section>
  );
}
