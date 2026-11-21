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
    // Stored editorial forecasts append a lunar-calendar paragraph after the sign's focus.
    forecast: /^Лунный диск освещён на \d/.test(remainder) ? '' : remainder,
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

export function daysUntilDate(date: string | undefined, today: string): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.toISOString().slice(0, 10) === value ? parsed.getTime() : null;
  };
  const from = toUtcDay(today);
  const to = toUtcDay(date);
  return from === null || to === null || to < from ? null : Math.round((to - from) / 86_400_000);
}

const MASTER_NUMBERS = new Set([11, 22, 33]);
const PERSONAL_DAY_MEANINGS: Record<number, string> = {
  1: 'Инициатива', 2: 'Внимание к диалогу', 3: 'Самовыражение', 4: 'Порядок и опора',
  5: 'Гибкость', 6: 'Забота', 7: 'Наблюдение', 8: 'Решительность', 9: 'Завершение',
  11: 'Вдохновение', 22: 'Большой замысел', 33: 'Сочувствие',
};

function reduceNumber(value: number): number {
  let result = value;
  while (result > 9 && !MASTER_NUMBERS.has(result)) {
    result = String(result).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return result;
}

function dateDigits(value: string): number[] | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const local = /^(\d{2})[./-](\d{2})[./-](\d{4})$/.exec(value);
  const parts = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2], local[1]] : null;
  if (!parts) return null;
  const [year, month, day] = parts.map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return parts.join('').split('').map(Number);
}

export function personalDay(birthDate?: string, currentDate?: string) {
  const birthDigits = birthDate ? dateDigits(birthDate) : null;
  const todayDigits = currentDate ? dateDigits(currentDate) : null;
  if (!birthDigits || !todayDigits) return null;
  const birthSum = birthDigits.reduce((sum, digit) => sum + digit, 0);
  const lifePath = reduceNumber(birthSum);
  const universalDay = reduceNumber(todayDigits.reduce((sum, digit) => sum + digit, 0));
  const value = reduceNumber(lifePath + universalDay);
  return {
    value,
    meaning: PERSONAL_DAY_MEANINGS[value] || 'Личный ритм',
    formula: `${birthDigits.join(' + ')} = ${birthSum} → ${lifePath}; ${todayDigits.join(' + ')} = ${todayDigits.reduce((sum, digit) => sum + digit, 0)} → ${universalDay}; ${lifePath} + ${universalDay} = ${value}`,
  };
}

const DAILY_PRACTICES: Record<string, string[]> = {
  new_moon: ['Запишите одно намерение на ближайшую неделю.', 'Выберите одну тему, которой хотите уделить внимание в новом цикле.'],
  waxing_crescent: ['Сделайте первый небольшой шаг к важному замыслу.', 'Выделите десять минут на дело, которое давно откладывали.'],
  first_quarter: ['Назовите главное препятствие и один способ пройти его.', 'Завершите один конкретный пункт из своего списка.'],
  waxing_gibbous: ['Пересмотрите план и уточните одну важную деталь.', 'Подготовьте то, что поможет завершить начатое.'],
  full_moon: ['Запишите, что сегодня стало для вас яснее.', 'Отметьте один результат, который обычно оставляете без внимания.'],
  waning_gibbous: ['Вспомните полезный урок последней недели и запишите его.', 'Поблагодарите себя за один пройденный этап.'],
  last_quarter: ['Освободите немного времени, отказавшись от одного лишнего дела.', 'Завершите небольшой хвост, который забирает внимание.'],
  waning_crescent: ['Устройте короткую паузу без экрана и прислушайтесь к себе.', 'Снизьте темп хотя бы на десять минут и восстановите силы.'],
};

export function dailyPractice(phase: string | undefined, date: string): string {
  const choices = DAILY_PRACTICES[phase || ''] || ['Выделите пять минут, чтобы записать, что сегодня для вас важно.'];
  const seed = Number(date.replace(/\D/g, '').slice(-4)) || 0;
  return choices[seed % choices.length];
}

const DAILY_QUESTIONS = [
  'Что сегодня заслуживает моего внимания?',
  'Какой разговор стоит начать?',
  'Что мне хочется попробовать по-другому?',
  'Какое маленькое дело облегчит завтрашний день?',
  'Как сегодня освободить время для важного?',
  'Что за эту неделю получилось лучше, чем я ожидал?',
  'Что поможет мне восстановить силы?',
];

export function dailyQuestion(date: string): string {
  const day = Math.floor(Date.parse(date) / 86_400_000);
  return DAILY_QUESTIONS[((day % DAILY_QUESTIONS.length) + DAILY_QUESTIONS.length) % DAILY_QUESTIONS.length]
    ?? DAILY_QUESTIONS[0];
}
