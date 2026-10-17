import { SettingRow } from '../SettingRow/SettingRow';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';
import './SettingsLoading.css';

export function SettingsLoading() {
  return PROFILE_SETTINGS.map((setting) => (
    <SettingRow key={setting} setting={setting}>
      <span
        role="status"
        aria-label="Loading your setting"
        className="setting-placeholder"
      />
    </SettingRow>
  ));
}
