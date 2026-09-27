import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import type { Study } from '../Study/Study';
import { StudyList } from './StudyList';

it("links each study, named by the study, to that study's page", () => {
  // Given two studies
  const data: Study[] = [
    { id: 'a4f1', name: 'London', side: 'white' },
    { id: 'b7c2', name: 'Caro-Kann', side: 'black' },
  ];

  // When the list renders
  render(
    <StudyList
      response={{
        success: true,
        data,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      }}
    />,
    { wrapper: MemoryRouter },
  );

  // Then each row links to its own study page, named by the study alone
  expect(screen.getByRole('link', { name: 'London' })).toHaveAttribute(
    'href',
    '/studies/a4f1',
  );
  expect(screen.getByRole('link', { name: 'Caro-Kann' })).toHaveAttribute(
    'href',
    '/studies/b7c2',
  );
});
