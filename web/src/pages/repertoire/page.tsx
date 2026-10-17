import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import { RepertoireList } from './elements/RepertoireList/RepertoireList';
import { RepertoireLoadError } from './elements/RepertoireLoadError/RepertoireLoadError';
import { RepertoireLoading } from './elements/RepertoireLoading/RepertoireLoading';
import './page.css';

export function Repertoire() {
  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <CreateFolderForm onCreated={() => {}} />
      <LoadBoundary Loading={RepertoireLoading} LoadError={RepertoireLoadError}>
        <RepertoireList />
      </LoadBoundary>
    </section>
  );
}
