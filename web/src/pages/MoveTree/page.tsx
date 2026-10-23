import { useParams } from 'react-router-dom';
import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { z } from '../../z';
import { MoveTreeDetails } from './elements/MoveTreeDetails/MoveTreeDetails';
import { MoveTreeLayout } from './elements/MoveTreeLayout/MoveTreeLayout';
import { MoveTreeLoadError } from './elements/MoveTreeLoadError/MoveTreeLoadError';
import { MoveTreeNotFound } from './elements/MoveTreeNotFound/MoveTreeNotFound';

const paramsSchema = z.object({ moveTreeId: z.uuid() });

export function MoveTree() {
  const params = paramsSchema.safeParse(useParams());

  return (
    <MoveTreeLayout>
      {params.success ? (
        <LoadBoundary
          key={params.data.moveTreeId}
          Loading={null}
          LoadError={MoveTreeLoadError}
        >
          <MoveTreeDetails moveTreeId={params.data.moveTreeId} />
        </LoadBoundary>
      ) : (
        <MoveTreeNotFound />
      )}
    </MoveTreeLayout>
  );
}
