import { passwordRules } from '../../elements/passwordRules/passwordRules';

export const meetsEveryRule = (password: string) =>
  passwordRules.every(({ met }) => met(password));
