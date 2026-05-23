/**
 * Moon Phases Constants
 * Centralized constants for moon phases used across the application
 */

export const MOON_PHASES: Record<string, string> = {
  new_moon: '🌑',
  waxing_crescent: '🌒',
  first_quarter: '🌓',
  waxing_gibbous: '🌔',
  full_moon: '🌕',
  waning_gibbous: '🌖',
  last_quarter: '🌗',
  waning_crescent: '🌘',
};

/**
 * Moon phase names in Russian
 * Used in TopHeaderBlock (shorter names) and UserInfoBlock (longer names)
 */
export const MOON_PHASE_NAMES: Record<string, string> = {
  new_moon: 'Новолуние',
  waxing_crescent: 'Растущая',
  first_quarter: 'Первая четверть',
  waxing_gibbous: 'Прибывающая',
  full_moon: 'Полнолуние',
  waning_gibbous: 'Убывающая',
  last_quarter: 'Последняя четверть',
  waning_crescent: 'Убывающий серп',
};

/**
 * Extended moon phase names (longer versions)
 * Used in UserInfoBlock
 */
export const MOON_PHASE_NAMES_EXTENDED: Record<string, string> = {
  new_moon: 'Новолуние',
  waxing_crescent: 'Растущая Луна',
  first_quarter: 'Первая четверть',
  waxing_gibbous: 'Прибывающая Луна',
  full_moon: 'Полнолуние',
  waning_gibbous: 'Убывающая Луна',
  last_quarter: 'Последняя четверть',
  waning_crescent: 'Убывающий серп',
};
