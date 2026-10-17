export const PROFILE_SETTINGS_QUERY_KEY = 'profileSettings';

export const PROFILE_SETTINGS = ['animate_pieces', 'show_move_hints'] as const;

export type ProfileSetting = (typeof PROFILE_SETTINGS)[number];

export const PROFILE_SETTING_LABELS: Record<ProfileSetting, string> = {
  animate_pieces: 'Animate pieces',
  show_move_hints: 'Show move hints',
};
