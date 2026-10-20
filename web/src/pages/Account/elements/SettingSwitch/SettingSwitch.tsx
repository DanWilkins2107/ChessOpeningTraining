import { useProfileSettings } from '../useProfileSettings/useProfileSettings';
import type { ProfileSetting } from '../useProfileSettings/useProfileSettings.constants';
import './SettingSwitch.css';

type SettingSwitchProps = {
  setting: ProfileSetting;
  chosen: boolean | undefined;
  choose: (value: boolean, loaded: boolean) => void;
};

export function SettingSwitch({ setting, chosen, choose }: SettingSwitchProps) {
  const loaded = useProfileSettings().data[setting];

  return (
    <input
      type="checkbox"
      role="switch"
      className="setting-switch"
      checked={chosen ?? loaded}
      onChange={(event) => choose(event.target.checked, loaded)}
    />
  );
}
