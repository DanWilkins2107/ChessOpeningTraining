import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { TextInput } from '../../../../shared/TextInput/TextInput';
import { supabase } from '../../../../supabase';
import { createFolderErrorMessage } from '../createFolderErrorMessage/createFolderErrorMessage';
import { SidePicker } from '../SidePicker/SidePicker';
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
    const side = String(new FormData(form).get('side'));
    setPending(true);
    const { error } = await supabase
      .from('folders')
      .insert({ name: name.trim(), side });
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
        <TextInput
          label="Folder name"
          name="name"
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          onChange={setName}
        />
        <SidePicker />
        <Button disabled={pending || name.trim() === ''}>Create folder</Button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}
