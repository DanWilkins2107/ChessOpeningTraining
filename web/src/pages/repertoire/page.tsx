import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { RepertoireList } from './elements/RepertoireList/RepertoireList';
import { RepertoireLoadError } from './elements/RepertoireLoadError/RepertoireLoadError';
import { RepertoireLoading } from './elements/RepertoireLoading/RepertoireLoading';
import './page.css';

export function Repertoire() {
  return (
    <section className="repertoire">
      <h1 className="repertoire-title">Repertoire</h1>
      <LoadBoundary Loading={RepertoireLoading} LoadError={RepertoireLoadError}>
        <RepertoireList />
      </LoadBoundary>
    </section>
  );
}
