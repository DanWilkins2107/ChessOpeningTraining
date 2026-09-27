import { use } from 'react';
import { BranchLoadError } from '../BranchLoadError/BranchLoadError';
import { BranchNotFound } from '../BranchNotFound/BranchNotFound';
import type { BranchResponse } from '../BranchResponse/BranchResponse';

export function BranchName({ branch }: { branch: Promise<BranchResponse> }) {
  const { data, error } = use(branch);

  if (error !== null) return <BranchLoadError />;
  if (data === null) return <BranchNotFound />;

  return <h1>{data.name}</h1>;
}
