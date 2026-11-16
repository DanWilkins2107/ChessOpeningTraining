import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { supabase } from '../../../../supabase';
import { createFolderErrorMessage } from '../createFolderErrorMessage/createFolderErrorMessage';
import { FolderTile } from '../FolderTile/FolderTile';
import './CreateFolderForm.css';

const NAME_MAX_LENGTH = 100;

type CreateFolderFormProps = {
  onCreated: () => void;
};

export function CreateFolderForm({ onCreated }: CreateFolderFormProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function createFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const { error } = await supabase
      .from('folders')
      .insert({ name: name.trim() });
    setPending(false);
    if (error) {
      setError(createFolderErrorMessage(error));
      return;
    }
    setError(undefined);
    form.reset();
    setName('');
    onCreated();
  }

  return (
    <form className="create-folder-form" onSubmit={createFolder}>
      <div className="create-folder-fields">
        <FolderTile />
        <input
          className="create-folder-name"
          aria-label="Folder name"
          name="name"
          type="text"
          autoComplete="off"
          autoFocus
          maxLength={NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Button disabled={pending || name.trim() === ''}>Create</Button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}
