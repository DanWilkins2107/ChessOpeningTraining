import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { SettingsLoadError } from '../SettingsLoadError/SettingsLoadError';
import { SettingsLoading } from '../SettingsLoading/SettingsLoading';
import { SettingToggle } from '../SettingToggle/SettingToggle';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';
import './ProfileSettings.css';

export function ProfileSettings() {
  return (
    <div className="profile-settings">
      <LoadBoundary Loading={SettingsLoading} LoadError={SettingsLoadError}>
        {PROFILE_SETTINGS.map((setting) => (
          <SettingToggle key={setting} setting={setting} />
        ))}
      </LoadBoundary>
    </div>
  );
}
