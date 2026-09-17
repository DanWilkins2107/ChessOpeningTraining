import { passwordRules } from './passwordRules';

export const meetsEveryRule = (password: string) =>
  passwordRules.every(({ met }) => met(password));
