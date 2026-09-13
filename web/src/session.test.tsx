import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Component, Suspense } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

type StartupRead = {
  data: { session: Session | null };
  error: Error | null;
};

const { auth, unsubscribe } = vi.hoisted(() => {
  const unsubscribe = vi.fn();
  return {
    unsubscribe,
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn<(listener: AuthListener) => object>(() => ({
        data: { subscription: { unsubscribe } },
      })),
    },
  };
});

// mock-reason: the startup read and the auth listener are the contract under
// test and must be driven by hand (held pending, failed, fired); the real
// client would read a stored session this test cannot control.
vi.mock('./supabase', () => ({ supabase: { auth } }));

let finishStartupRead: (read: StartupRead) => void;

const sessionOf = (id: string) => ({ user: { id } }) as Session;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  auth.getSession.mockReturnValue(
    new Promise<StartupRead>((resolve) => {
      finishStartupRead = resolve;
    }),
  );
});

afterEach(cleanup);

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  render() {
    return this.state.message ?? this.props.children;
  }
}

async function renderUser() {
  const { useUser } = await import('./session');

  function UserId() {
    return useUser()?.id ?? 'signed out';
  }

  return act(async () =>
    render(
      <ErrorBoundary>
        <Suspense fallback="Loading…">
          <UserId />
        </Suspense>
      </ErrorBoundary>,
    ),
  );
}

async function renderUserFrom(read: StartupRead) {
  const view = await renderUser();
  await finishStartup(read);
  return view;
}

const finishStartup = (read: StartupRead) =>
  act(async () => finishStartupRead(read));

const fireAuthChange = (event: AuthChangeEvent, session: Session | null) =>
  act(() => auth.onAuthStateChange.mock.calls[0][0](event, session));

it('reads the stored session at module load, before any render', async () => {
  await import('./session');

  expect(auth.getSession).toHaveBeenCalledOnce();
});

it('suspends until the stored session is read, then returns its user', async () => {
  await renderUser();
  expect(screen.getByText('Loading…')).toBeInTheDocument();

  await finishStartup({ data: { session: sessionOf('u1') }, error: null });

  expect(screen.getByText('u1')).toBeInTheDocument();
});

it('returns null when no session is stored', async () => {
  await renderUserFrom({ data: { session: null }, error: null });

  expect(screen.getByText('signed out')).toBeInTheDocument();
});

it('surfaces a failed session read instead of returning null', async () => {
  await renderUserFrom({
    data: { session: null },
    error: new Error('no read'),
  });

  expect(screen.getByText('no read')).toBeInTheDocument();
});

it('follows auth changes, and signing out gives null', async () => {
  await renderUserFrom({ data: { session: null }, error: null });

  fireAuthChange('SIGNED_IN', sessionOf('u2'));
  expect(screen.getByText('u2')).toBeInTheDocument();

  fireAuthChange('SIGNED_OUT', null);
  expect(screen.getByText('signed out')).toBeInTheDocument();
});

it('subscribes once across re-renders and unsubscribes on unmount', async () => {
  const { unmount } = await renderUserFrom({
    data: { session: sessionOf('u1') },
    error: null,
  });

  fireAuthChange('TOKEN_REFRESHED', sessionOf('u3'));
  expect(screen.getByText('u3')).toBeInTheDocument();
  expect(auth.onAuthStateChange).toHaveBeenCalledOnce();
  expect(unsubscribe).not.toHaveBeenCalled();

  unmount();
  expect(unsubscribe).toHaveBeenCalledOnce();
});
