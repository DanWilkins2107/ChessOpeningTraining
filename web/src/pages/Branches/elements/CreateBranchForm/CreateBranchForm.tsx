import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { TextInput } from '../../../../shared/TextInput/TextInput';
import { supabase } from '../../../../supabase';
import { createBranchErrorMessage } from '../createBranchErrorMessage/createBranchErrorMessage';
import { SidePicker } from '../SidePicker/SidePicker';
import './CreateBranchForm.css';

const NAME_MAX_LENGTH = 100;

type CreateBranchFormProps = {
  onCreated: () => void;
};

export function CreateBranchForm({ onCreated }: CreateBranchFormProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function createBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const side = String(new FormData(form).get('side'));
    setPending(true);
    const { error } = await supabase
      .from('branches')
      .insert({ name: name.trim(), side });
    setPending(false);
    if (error) {
      setError(createBranchErrorMessage(error));
      return;
    }
    setError(undefined);
    form.reset();
    setName('');
    onCreated();
  }

  return (
    <form className="create-branch-form" onSubmit={createBranch}>
      <div className="create-branch-fields">
        <TextInput
          label="Branch name"
          name="name"
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          onChange={setName}
        />
        <SidePicker />
        <Button disabled={pending || name.trim() === ''}>Create branch</Button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}
