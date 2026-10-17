import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { SettingRow } from '../SettingRow/SettingRow';
import { useProfileSettings } from '../useProfileSettings/useProfileSettings';
import type { ProfileSetting } from '../useProfileSettings/useProfileSettings.constants';
import { useSaveProfileSetting } from '../useSaveProfileSetting/useSaveProfileSetting';
import './SettingToggle.css';

type SettingToggleProps = { setting: ProfileSetting };

export function SettingToggle({ setting }: SettingToggleProps) {
  const { data } = useProfileSettings();
  const { value, choose, outcome } = useSaveProfileSetting(
    setting,
    data[setting],
  );

  return (
    <>
      <SettingRow setting={setting}>
        <input
          type="checkbox"
          role="switch"
          className="setting-switch"
          checked={value}
          onChange={(event) => choose(event.target.checked)}
        />
      </SettingRow>
      {outcome === 'failed' && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
      {outcome === 'saved' && <SuccessMessage>Saved</SuccessMessage>}
    </>
  );
}
