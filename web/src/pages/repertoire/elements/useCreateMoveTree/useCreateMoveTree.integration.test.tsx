import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it } from 'vitest';
import { createQueryClient } from '../../../../elements/createQueryClient/createQueryClient';
import { supabase } from '../../../../supabase';
import { createTestUser } from '../../../../tests-shared/testUser';
import { useCreateMoveTree } from './useCreateMoveTree';

function renderCreateMoveTreeTestingHarness() {
  const client = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(useCreateMoveTree, { wrapper }).result;
}

type Created = ReturnType<typeof renderCreateMoveTreeTestingHarness>;

async function create(
  hook: Created,
  moveTree: Parameters<Created['current']['createMoveTree']>[0],
) {
  let succeeded = false;
  await act(
    () =>
      new Promise<void>((resolve) =>
        hook.current.createMoveTree(moveTree, {
          onSuccess: () => (succeeded = true),
          onSettled: () => resolve(),
        }),
      ),
  );
  return succeeded;
}

const newestMoveTree = async () =>
  (
    await supabase
      .from('move_trees')
      .select('folder_id, name, side')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ).data;

it('creates a move tree in the folder on the given side', async () => {
  // Given a signed-in user with a folder
  const moveTreeAuthor = await createTestUser();
  const client = await moveTreeAuthor.signedInClient();
  const { data: londonFolder, error } = await client
    .from('folders')
    .insert({ name: 'London' })
    .select('id')
    .single();
  if (error) throw error;
  await moveTreeAuthor.signIn();
  const hook = renderCreateMoveTreeTestingHarness();

  // When they create a black move tree in their folder
  const succeeded = await create(hook, {
    folderId: londonFolder.id,
    name: 'Caro-Kann',
    side: 'black',
  });

  // Then it succeeds and is stored there, with no error
  expect(succeeded).toBe(true);
  expect(await newestMoveTree()).toEqual({
    folder_id: londonFolder.id,
    name: 'Caro-Kann',
    side: 'black',
  });
  expect(hook.current.error).toBeUndefined();
});

it('creates a top-level move tree without a folder', async () => {
  // Given a signed-in user
  const moveTreeAuthor = await createTestUser();
  await moveTreeAuthor.signIn();
  const hook = renderCreateMoveTreeTestingHarness();

  // When they create a move tree with no folder
  await create(hook, { folderId: null, name: 'Sidelines', side: 'white' });

  // Then it is stored outside any folder
  expect((await newestMoveTree())?.folder_id).toBeNull();
});

it('trims the name it stores', async () => {
  // Given a signed-in user
  const moveTreeAuthor = await createTestUser();
  await moveTreeAuthor.signIn();
  const hook = renderCreateMoveTreeTestingHarness();

  // When they create a move tree named with surrounding spaces
  await create(hook, { folderId: null, name: '  Slav  ', side: 'white' });

  // Then the stored name is trimmed
  expect((await newestMoveTree())?.name).toBe('Slav');
});

it('explains the 500-move-tree cap', async () => {
  // Given a signed-in user who already has 500 move trees
  const atTheMoveTreeCap = await createTestUser();
  const client = await atTheMoveTreeCap.signedInClient();
  const { error } = await client.from('move_trees').insert(
    Array.from({ length: 500 }, (_, index) => ({
      name: `Filler ${index}`,
      side: 'white',
    })),
  );
  if (error) throw error;
  await atTheMoveTreeCap.signIn();
  const hook = renderCreateMoveTreeTestingHarness();

  // When they create another
  await create(hook, { folderId: null, name: 'One too many', side: 'white' });

  // Then they are told about the cap
  await waitFor(() =>
    expect(hook.current.error).toBe('You can have at most 500 move trees'),
  );
});

it('clears an earlier failure once created', async () => {
  // Given a failed create while signed out
  const moveTreeAuthor = await createTestUser();
  const hook = renderCreateMoveTreeTestingHarness();
  await create(hook, { folderId: null, name: 'Dutch', side: 'white' });
  await waitFor(() =>
    expect(hook.current.error).toBe(
      "Couldn't create your move tree, try again",
    ),
  );

  // When the user signs in and creates it again
  await moveTreeAuthor.signIn();
  await create(hook, { folderId: null, name: 'Dutch', side: 'white' });

  // Then the error is gone
  await waitFor(() => expect(hook.current.error).toBeUndefined());
});
