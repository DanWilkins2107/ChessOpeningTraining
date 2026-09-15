import type { PostgrestResponse } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useUser } from '../../elements/session';
import { supabase } from '../../supabase';
import './page.css';

type Study = {
  id: string;
  name: string;
  side: 'white' | 'black';
};

type StudiesResponse = PostgrestResponse<Study>;

function useStudies(): StudiesResponse | undefined {
  const userId = useUser()?.id;
  const [loaded, setLoaded] = useState<{
    userId?: string;
    response?: StudiesResponse;
  }>({});

  useEffect(() => {
    if (userId === undefined) return;

    let current = true;
    supabase
      .from('studies')
      .select()
      .order('created_at', { ascending: false })
      .then((response) => {
        if (current) setLoaded({ userId, response });
      });
    return () => {
      current = false;
    };
  }, [userId]);

  return loaded.userId === userId ? loaded.response : undefined;
}

export function Studies() {
  const response = useStudies();

  return (
    <section className="studies">
      <h1>Studies</h1>
      <StudyList response={response} />
    </section>
  );
}

function StudyList({ response }: { response: StudiesResponse | undefined }) {
  if (response === undefined) {
    return (
      <div
        role="status"
        aria-label="Loading studies"
        className="studies-spinner"
      />
    );
  }

  if (response.error) {
    return (
      <p role="alert" className="studies-error">
        Couldn't load your studies, try again
      </p>
    );
  }

  if (response.data.length === 0) {
    return <p className="studies-empty">No studies yet</p>;
  }

  return (
    <ul className="studies-list">
      {response.data.map(({ id, name, side }) => (
        <li key={id} className="studies-item">
          <span className="studies-name">{name}</span>
          <span className="studies-side">{side}</span>
        </li>
      ))}
    </ul>
  );
}
