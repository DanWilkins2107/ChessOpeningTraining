import type { ReactNode } from 'react';
import {
  PROFILE_SETTING_LABELS,
  type ProfileSetting,
} from '../useProfileSettings/useProfileSettings.constants';
import './SettingRow.css';

type SettingRowProps = { setting: ProfileSetting; children?: ReactNode };

export function SettingRow({ setting, children }: SettingRowProps) {
  return (
    <label className="setting-row">
      {PROFILE_SETTING_LABELS[setting]}
      {children}
    </label>
  );
}
