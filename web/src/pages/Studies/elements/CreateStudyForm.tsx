import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { createStudyErrorMessage } from './createStudyErrorMessage';
import { SidePicker } from './SidePicker';
import './CreateStudyForm.css';

const NAME_MAX_LENGTH = 100;

type CreateStudyFormProps = {
  onCreated: () => void;
};

export function CreateStudyForm({ onCreated }: CreateStudyFormProps) {
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function createStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const side = String(new FormData(form).get('side'));
    setPending(true);
    const { error } = await supabase
      .from('studies')
      .insert({ name: name.trim(), side });
    setPending(false);
    if (error) {
      setError(createStudyErrorMessage(error));
      return;
    }
    setError(undefined);
    form.reset();
    setName('');
    onCreated();
  }

  return (
    <form className="create-study-form" onSubmit={createStudy}>
      <div className="create-study-fields">
        <TextInput
          label="Study name"
          name="name"
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          onChange={setName}
        />
        <SidePicker />
        <Button disabled={pending || name.trim() === ''}>Create study</Button>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </form>
  );
}
