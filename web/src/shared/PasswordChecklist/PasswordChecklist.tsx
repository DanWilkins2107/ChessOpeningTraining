import { passwordRules } from '../../elements/passwordRules/passwordRules';
import './PasswordChecklist.css';

type PasswordChecklistProps = {
  password: string;
};

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <ul className="password-checklist" aria-label="Password needs">
      {passwordRules.map(({ label, met }) =>
        met(password) ? (
          <li key={label} className="password-rule password-rule-met">
            {label}
            <span className="password-rule-state"> (done)</span>
          </li>
        ) : (
          <li key={label} className="password-rule">
            {label}
          </li>
        ),
      )}
    </ul>
  );
}
