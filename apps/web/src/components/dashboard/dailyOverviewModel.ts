import { ZODIAC_SIGNS } from '../../constants/zodiac';

export interface DailyForecast {
  date: string;
  prediction: string;
  plain_text?: string;
  advice?: string;
  is_personalized?: boolean;
}

export interface DailyMoon {
  date: string;
  phase: string;
  phase_name: string;
  illumination?: number | null;
  zodiac_sign?: string;
  next_full_moon?: string;
  next_new_moon?: string;
  description?: string;
}

export function resolveTimeZone(value?: string): string {
  try {
    const zone = value || Intl.DateTimeFormat().resolvedOptions().timeZone;
    new Intl.DateTimeFormat('ru-RU', { timeZone: zone }).format();
    return zone;
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }
}

export function dayInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function resolveZodiac(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return Object.entries(ZODIAC_SIGNS).find(([key, sign]) =>
    key === normalized || sign.name.toLowerCase() === normalized
  );
}

export function cleanText(value?: string): string {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\*\*|__|#{1,6}\s/g, '')
    .replace(/\s+/g, ' ').trim();
}

export function forecastCopy(forecast: DailyForecast | null) {
  const text = cleanText(forecast?.plain_text || forecast?.prediction);
  const first = text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() || text;
  const focus = first.length > 150 ? `${first.slice(0, 147).replace(/\s+\S*$/, '')}…` : first;
  // The full result remains on the service page; the summary does not repeat it twice.
  const remainder = text.slice(first.length).trim();
  const advice = cleanText(forecast?.advice);
  return {
    focus,
    forecast: remainder || (text ? 'Прогноз собран. Откройте его, чтобы прочитать детали и пояснения.' : ''),
    advice: advice && advice !== first && advice !== text ? advice : '',
  };
}

export function illuminationOf(moon: DailyMoon | null): number | null {
  const value = moon?.illumination;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
    ? value : null;
}

const RHYTHMS: Record<string, { title: string; text: string }> = {
  new_moon: { title: 'Время намерений', text: 'Символический ритм новолуния: пауза, наблюдение и спокойное планирование.' },
  waxing_crescent: { title: 'Первые шаги', text: 'Растущий серп символизирует начало: выберите одно небольшое действие.' },
  first_quarter: { title: 'Время действия', text: 'Первая четверть — символ движения: определите главное и проверьте свои планы.' },
  waxing_gibbous: { title: 'Собрать воедино', text: 'Растущая Луна напоминает о внимании к деталям и подготовке к завершению.' },
  full_moon: { title: 'Ясность и завершение', text: 'Полнолуние символизирует проявленность: подведите итоги и отметьте важное.' },
  waning_gibbous: { title: 'Осмыслить опыт', text: 'Убывающая Луна — символ спокойного анализа и благодарности за пройденное.' },
  last_quarter: { title: 'Освободить пространство', text: 'Последняя четверть напоминает о пересмотре планов и завершении лишнего.' },
  waning_crescent: { title: 'Бережная пауза', text: 'Убывающий серп символизирует отдых, наблюдение и подготовку к новому циклу.' },
};

export function lunarRhythm(moon: DailyMoon | null) {
  return moon ? RHYTHMS[moon.phase] || null : null;
}

export function nextMoonEvent(moon: DailyMoon | null, today: string) {
  // API events are calendar dates, not timestamps. Compare without shifting them into another day.
  const events = [
    { date: moon?.next_full_moon, title: 'Полнолуние', symbol: '○' },
    { date: moon?.next_new_moon, title: 'Новолуние', symbol: '●' },
  ].filter((event): event is { date: string; title: string; symbol: string } => {
    if (!event.date || !/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return false;
    const date = new Date(`${event.date}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === event.date && event.date >= today;
  });
  return events.sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}
