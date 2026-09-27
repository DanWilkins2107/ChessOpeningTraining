import { useParams } from 'react-router-dom';
import { z } from '../../z';
import { BranchDetails } from './elements/BranchDetails/BranchDetails';
import { BranchNotFound } from './elements/BranchNotFound/BranchNotFound';
import './page.css';

const paramsSchema = z.object({ branchId: z.uuid() });

export function Branch() {
  const params = paramsSchema.safeParse(useParams());

  return (
    <section aria-label="Branch" className="branch">
      {params.success ? (
        <BranchDetails branchId={params.data.branchId} />
      ) : (
        <BranchNotFound />
      )}
    </section>
  );
}
