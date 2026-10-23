import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';

export function ProfileSettingsLoadError() {
  return <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>;
}
