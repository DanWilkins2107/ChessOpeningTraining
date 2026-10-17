import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../../shared/ErrorMessage/ErrorMessage';
import { TextInput } from '../../../../../shared/TextInput/TextInput';
import { supabase } from '../../../../../supabase';
import { createMoveTreeErrorMessage } from '../createMoveTreeErrorMessage/createMoveTreeErrorMessage';
import { SidePicker } from '../SidePicker/SidePicker';
import './CreateMoveTreeForm.css';

const NAME_MAX_LENGTH = 100;

type CreateMoveTreeFormProps = {
  folderId: string | null;
  onCreated: () => void;
};

export function CreateMoveTreeForm({
  folderId,
  onCreated,
}: CreateMoveTreeFormProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function createMoveTree(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const side = String(new FormData(form).get('side'));
    setPending(true);
    const { error } = await supabase
      .from('move_trees')
      .insert({ folder_id: folderId, name: name.trim(), side });
    setPending(false);
    if (error) {
      setError(createMoveTreeErrorMessage(error));
      return;
    }
    setError(undefined);
    form.reset();
    setName('');
    onCreated();
  }

  return (
    <form className="create-move-tree-form" onSubmit={createMoveTree}>
      <div className="create-move-tree-fields">
        <TextInput
          label="Move tree name"
          name="name"
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          onChange={setName}
        />
        <SidePicker />
        <Button disabled={pending || name.trim() === ''}>
          Create move tree
        </Button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}
