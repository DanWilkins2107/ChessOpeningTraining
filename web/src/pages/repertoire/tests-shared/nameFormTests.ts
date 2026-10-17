import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, it } from 'vitest';

type NameForm = {
  renderForm: () => string[];
  signIn: () => Promise<unknown>;
  nameLabel: string;
  createLabel: string;
};

export function nameFormTests({
  renderForm,
  signIn,
  nameLabel,
  createLabel,
}: NameForm) {
  const createButton = () => screen.getByRole('button', { name: createLabel });
  const nameField = () => screen.getByLabelText(nameLabel);

  it('clears an earlier failure once created', async () => {
    // Given a failed create on the form
    const creations = renderForm();
    fireEvent.change(nameField(), { target: { value: 'Dutch' } });
    fireEvent.click(createButton());
    await screen.findByRole('alert');

    // When the user signs in and creates it again
    await signIn();
    fireEvent.click(createButton());
    await waitFor(() => expect(creations).toHaveLength(1));

    // Then the message is gone
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps create disabled until a name is typed', () => {
    // Given the form

    // When it renders
    renderForm();

    // Then create is disabled
    expect(createButton()).toBeDisabled();
  });

  it('keeps create disabled for a name of only spaces', () => {
    // Given the form
    renderForm();

    // When only spaces are typed
    fireEvent.change(nameField(), { target: { value: '   ' } });

    // Then create is still disabled
    expect(createButton()).toBeDisabled();
  });

  it('enables create once a name is typed', () => {
    // Given the form
    renderForm();

    // When a name is typed
    fireEvent.change(nameField(), { target: { value: 'Pirc' } });

    // Then create is enabled
    expect(createButton()).toBeEnabled();
  });

  it('caps the name at 100 characters', () => {
    // Given the form

    // When it renders
    renderForm();

    // Then the name field takes no more than 100 characters
    expect(nameField()).toHaveAttribute('maxlength', '100');
  });

  it('disables create until the attempt finishes', async () => {
    // Given a name on the form
    renderForm();
    fireEvent.change(nameField(), { target: { value: 'Grunfeld' } });

    // When the form is submitted
    const submitted = fireEvent.submit(createButton().closest('form')!);

    // Then the browser's own submission is cancelled, and create is disabled
    // until the attempt finishes
    expect(submitted).toBe(false);
    expect(createButton()).toBeDisabled();
    await screen.findByRole('alert');
    expect(createButton()).toBeEnabled();
  });
}
