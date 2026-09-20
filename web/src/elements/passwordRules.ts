// Mirrors minimum_password_length and password_requirements in
// supabase/config.toml, which the server enforces. The server counts bytes,
// never fewer than .length, so this never passes a password it rejects.
const SYMBOLS = `!@#$%^&*()_+-=[]{};'\\:"|<>?,./\`~`;

export const passwordRules = [
  {
    label: 'At least 8 characters',
    met: (password: string) => password.length >= 8,
  },
  {
    label: 'A lowercase letter',
    met: (password: string) => /[a-z]/.test(password),
  },
  {
    label: 'An uppercase letter',
    met: (password: string) => /[A-Z]/.test(password),
  },
  { label: 'A number', met: (password: string) => /[0-9]/.test(password) },
  {
    label: 'A symbol',
    met: (password: string) =>
      [...password].some((char) => SYMBOLS.includes(char)),
  },
];
