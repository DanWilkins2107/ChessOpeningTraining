import { LoadErrorBoundary } from '../../../../shared/LoadErrorBoundary/LoadErrorBoundary';
import { ProfileSettingsLoadError } from '../ProfileSettingsLoadError/ProfileSettingsLoadError';
import { SettingToggle } from '../SettingToggle/SettingToggle';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';
import './ProfileSettings.css';

export function ProfileSettings() {
  return (
    <div className="profile-settings">
      <LoadErrorBoundary LoadError={ProfileSettingsLoadError}>
        {PROFILE_SETTINGS.map((setting) => (
          <SettingToggle key={setting} setting={setting} />
        ))}
      </LoadErrorBoundary>
    </div>
  );
}
