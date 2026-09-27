import { Suspense } from 'react';
import { ChapterList } from '../ChapterList/ChapterList';
import { BranchLoading } from '../BranchLoading/BranchLoading';
import { BranchName } from '../BranchName/BranchName';
import { useBranch } from '../useBranch/useBranch';

export function BranchDetails({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);

  if (branch === undefined) return <BranchLoading />;

  return (
    <Suspense key={branchId} fallback={<BranchLoading />}>
      <BranchName branch={branch} />
      <ChapterList branch={branch} />
    </Suspense>
  );
}
