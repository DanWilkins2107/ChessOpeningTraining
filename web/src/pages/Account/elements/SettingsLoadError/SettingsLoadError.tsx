import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { SettingRow } from '../SettingRow/SettingRow';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';

export function SettingsLoadError() {
  return (
    <>
      {PROFILE_SETTINGS.map((setting) => (
        <SettingRow key={setting} setting={setting} />
      ))}
      <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>
    </>
  );
}
