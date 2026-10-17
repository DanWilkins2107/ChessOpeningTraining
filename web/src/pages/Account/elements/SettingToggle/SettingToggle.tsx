import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { SettingRow } from '../SettingRow/SettingRow';
import { SettingSwitch } from '../SettingSwitch/SettingSwitch';
import { SettingSwitchLoadError } from '../SettingSwitchLoadError/SettingSwitchLoadError';
import { SettingSwitchLoading } from '../SettingSwitchLoading/SettingSwitchLoading';
import type { ProfileSetting } from '../useProfileSettings/useProfileSettings.constants';
import { useSaveProfileSetting } from '../useSaveProfileSetting/useSaveProfileSetting';

type SettingToggleProps = { setting: ProfileSetting };

export function SettingToggle({ setting }: SettingToggleProps) {
  const { chosen, choose, outcome } = useSaveProfileSetting(setting);

  return (
    <>
      <SettingRow setting={setting}>
        <LoadBoundary
          Loading={SettingSwitchLoading}
          LoadError={SettingSwitchLoadError}
        >
          <SettingSwitch setting={setting} chosen={chosen} choose={choose} />
        </LoadBoundary>
      </SettingRow>
      {outcome === 'failed' && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
      {outcome === 'saved' && <SuccessMessage>Saved</SuccessMessage>}
    </>
  );
}
