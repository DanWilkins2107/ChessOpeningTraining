import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { createStudyErrorMessage } from './createStudyErrorMessage';
import { SidePicker } from './SidePicker';
import { STUDIES_QUERY_KEY } from './useStudies.constants';
import './CreateStudyForm.css';

const NAME_MAX_LENGTH = 100;

type NewStudy = { name: string; side: string };

async function insertStudy(study: NewStudy) {
  const { error } = await supabase.from('studies').insert(study);
  if (error) throw error;
}

export function CreateStudyForm() {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation<
    void,
    PostgrestError,
    NewStudy
  >({
    mutationFn: insertStudy,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: STUDIES_QUERY_KEY }),
  });

  function createStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const side = String(new FormData(form).get('side'));
    mutate(
      { name: name.trim(), side },
      {
        onSuccess: () => {
          form.reset();
          setName('');
        },
      },
    );
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
        <Button disabled={isPending || name.trim() === ''}>Create study</Button>
      </div>
      {error && <ErrorMessage>{createStudyErrorMessage(error)}</ErrorMessage>}
    </form>
  );
}
