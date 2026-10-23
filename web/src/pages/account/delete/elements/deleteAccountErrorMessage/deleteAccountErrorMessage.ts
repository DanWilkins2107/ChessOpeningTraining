export const deleteAccountErrorMessage = ({ code }: { code?: string }) =>
  code === 'invalid_credentials'
    ? 'Incorrect password'
    : "Couldn't delete your account, try again";
