import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { ProfileSettingsLoadError } from '../ProfileSettingsLoadError/ProfileSettingsLoadError';
import { SettingToggle } from '../SettingToggle/SettingToggle';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';
import './ProfileSettings.css';

// Each switch shows its own loading placeholder; this boundary only gives the
// list one shared load error.
export function ProfileSettings() {
  return (
    <div className="profile-settings">
      <LoadBoundary Loading={null} LoadError={ProfileSettingsLoadError}>
        {PROFILE_SETTINGS.map((setting) => (
          <SettingToggle key={setting} setting={setting} />
        ))}
      </LoadBoundary>
    </div>
  );
}
