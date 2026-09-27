import { CreateBranchForm } from './elements/CreateBranchForm/CreateBranchForm';
import { BranchList } from './elements/BranchList/BranchList';
import { useBranches } from './elements/useBranches/useBranches';
import './page.css';

export function Branches() {
  const { response, refresh } = useBranches();

  return (
    <section className="branches">
      <h1>Branches</h1>
      <CreateBranchForm onCreated={refresh} />
      <BranchList response={response} />
    </section>
  );
}
