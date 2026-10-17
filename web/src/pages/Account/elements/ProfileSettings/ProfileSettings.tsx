import { SettingToggle } from '../SettingToggle/SettingToggle';
import { PROFILE_SETTINGS } from '../useProfileSettings/useProfileSettings.constants';
import './ProfileSettings.css';

export function ProfileSettings() {
  return (
    <div className="profile-settings">
      {PROFILE_SETTINGS.map((setting) => (
        <SettingToggle key={setting} setting={setting} />
      ))}
    </div>
  );
}
