/**
 * Zodiac Signs Constants
 * Centralized constants for zodiac signs used across the application
 */

export const ZODIAC_SIGNS: Record<
  string,
  {
    name: string;
    emoji: string;
    dates: string;
    element: string;
    planet: string;
    image: string;
  }
> = {
  aries: {
    name: 'Овен',
    emoji: '♈',
    dates: '21 марта - 19 апреля',
    element: 'Огонь',
    planet: 'Марс',
    image: '/zodiac/aries.png',
  },
  taurus: {
    name: 'Телец',
    emoji: '♉',
    dates: '20 апреля - 20 мая',
    element: 'Земля',
    planet: 'Венера',
    image: '/zodiac/taurus.png',
  },
  gemini: {
    name: 'Близнецы',
    emoji: '♊',
    dates: '21 мая - 20 июня',
    element: 'Воздух',
    planet: 'Меркурий',
    image: '/zodiac/gemini.png',
  },
  cancer: {
    name: 'Рак',
    emoji: '♋',
    dates: '21 июня - 22 июля',
    element: 'Вода',
    planet: 'Луна',
    image: '/zodiac/cancer.png',
  },
  leo: {
    name: 'Лев',
    emoji: '♌',
    dates: '23 июля - 22 августа',
    element: 'Огонь',
    planet: 'Солнце',
    image: '/zodiac/leo.png',
  },
  virgo: {
    name: 'Дева',
    emoji: '♍',
    dates: '23 августа - 22 сентября',
    element: 'Земля',
    planet: 'Меркурий',
    image: '/zodiac/virgo.png',
  },
  libra: {
    name: 'Весы',
    emoji: '♎',
    dates: '23 сентября - 22 октября',
    element: 'Воздух',
    planet: 'Венера',
    image: '/zodiac/libra.png',
  },
  scorpio: {
    name: 'Скорпион',
    emoji: '♏',
    dates: '23 октября - 21 ноября',
    element: 'Вода',
    planet: 'Плутон',
    image: '/zodiac/scorpio.png',
  },
  sagittarius: {
    name: 'Стрелец',
    emoji: '♐',
    dates: '22 ноября - 21 декабря',
    element: 'Огонь',
    planet: 'Юпитер',
    image: '/zodiac/sagittarius.png',
  },
  capricorn: {
    name: 'Козерог',
    emoji: '♑',
    dates: '22 декабря - 19 января',
    element: 'Земля',
    planet: 'Сатурн',
    image: '/zodiac/capricorn.png',
  },
  aquarius: {
    name: 'Водолей',
    emoji: '♒',
    dates: '20 января - 18 февраля',
    element: 'Воздух',
    planet: 'Уран',
    image: '/zodiac/aquarius.png',
  },
  pisces: {
    name: 'Рыбы',
    emoji: '♓',
    dates: '19 февраля - 20 марта',
    element: 'Вода',
    planet: 'Нептун',
    image: '/zodiac/pisces.png',
  },
};

export const ZODIAC_KEYS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

/**
 * Zodiac emojis mapping
 * Supports both Russian and English names
 */
export const ZODIAC_EMOJIS: Record<string, string> = {
  Овен: '♈',
  Aries: '♈',
  Телец: '♉',
  Taurus: '♉',
  Близнецы: '♊',
  Gemini: '♊',
  Рак: '♋',
  Cancer: '♋',
  Лев: '♌',
  Leo: '♌',
  Дева: '♍',
  Virgo: '♍',
  Весы: '♎',
  Libra: '♎',
  Скорпион: '♏',
  Scorpio: '♏',
  Стрелец: '♐',
  Sagittarius: '♐',
  Козерог: '♑',
  Capricorn: '♑',
  Водолей: '♒',
  Aquarius: '♒',
  Рыбы: '♓',
  Pisces: '♓',
};
