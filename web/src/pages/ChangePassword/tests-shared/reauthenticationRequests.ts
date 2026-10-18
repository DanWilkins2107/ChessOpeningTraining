import { vi } from 'vitest';

type Answer = (input: RequestInfo | URL, init?: RequestInit) => Response | null;

const isPasswordUpdate = (input: RequestInfo | URL, init?: RequestInit) =>
  String(input).endsWith('/user') && init?.method === 'PUT';

const refusePasswordUpdate =
  (error_code: string): Answer =>
  (input, init) =>
    isPasswordUpdate(input, init)
      ? Response.json({ error_code, msg: error_code }, { status: 400 })
      : null;

export const askForReauthentication = refusePasswordUpdate(
  'reauthentication_needed',
);

export const rejectCode = refusePasswordUpdate('reauthentication_not_valid');

export const failToSendCode: Answer = (input) =>
  String(input).endsWith('/reauthenticate')
    ? Response.json({ msg: 'Failed' }, { status: 500 })
    : null;

export function once(answer: Answer): Answer {
  let answered = false;
  return (input, init) => {
    if (answered) return null;
    const response = answer(input, init);
    answered = response !== null;
    return response;
  };
}

export function answerRequests(...answers: Answer[]) {
  const realFetch = window.fetch;
  // mock-reason: the server asks for a code only from a session over a day old,
  // which a browser test cannot make, and cannot be made to fail sending one or
  // to reject one on demand. Only the answered requests are faked; the rest are real.
  return vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    const answered = answers
      .map((answer) => answer(input, init))
      .find((response) => response !== null);
    return answered ? Promise.resolve(answered) : realFetch(input, init);
  });
}

export const passwordUpdateBodies = (
  fetches: ReturnType<typeof answerRequests>,
) =>
  fetches.mock.calls
    .filter(([input, init]) => isPasswordUpdate(input, init))
    .map(([, init]) => JSON.parse(String(init?.body)));
