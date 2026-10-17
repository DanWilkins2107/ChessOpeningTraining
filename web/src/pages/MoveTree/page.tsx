import { useParams } from 'react-router-dom';
import { z } from '../../z';
import { MoveTreeDetails } from './elements/MoveTreeDetails/MoveTreeDetails';
import { MoveTreeNotFound } from './elements/MoveTreeNotFound/MoveTreeNotFound';

const paramsSchema = z.object({ moveTreeId: z.uuid() });

export function MoveTree() {
  const params = paramsSchema.safeParse(useParams());

  return params.success ? (
    <MoveTreeDetails moveTreeId={params.data.moveTreeId} />
  ) : (
    <MoveTreeNotFound />
  );
}
