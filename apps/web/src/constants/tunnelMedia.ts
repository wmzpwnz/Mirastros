export type TunnelVideoSource = {
  webm: string;
  mp4: string;
  poster?: string;
};

export type TunnelMediaTrack = Array<TunnelVideoSource | null>;

const media = (name: string): TunnelVideoSource => ({
  webm: `/${name}.webm`,
  mp4: `/${name}.mp4`,
});

export const LANDING_TUNNEL_MEDIA: TunnelMediaTrack = [
  null,
  media('taro'),
  media('astro'),
  media('horo'),
  media('natal'),
  media('runes'),
  media('numer'),
  media('sonnik'),
  media('ci'),
  media('lenorman'),
  media('chakras'),
  media('planet'),
  media('sinastr'),
  media('moon'),
  media('crystal'),
  media('ritual'),
  media('horar'),
  media('solar'),
  media('karma'),
  media('mandala'),
  null,
];

export const DASHBOARD_TUNNEL_MEDIA: TunnelMediaTrack = [
  null,
  media('taro'),
  media('astro'),
  media('horo'),
  media('natal'),
  media('matrix_destiny'),
  media('runes'),
  media('numer'),
  media('sonnik'),
  media('ci'),
  media('lenorman'),
  media('chakras'),
  media('planet'),
  media('sinastr'),
  media('moon'),
  media('crystal'),
  media('ritual'),
  media('horar'),
  media('solar'),
  media('karma'),
  media('mandala'),
  null,
];

export const SERVICE_TUNNEL_MEDIA = {
  tarot: media('taro'),
  astrology: media('astro'),
  horoscope: media('horo'),
  natal: media('natal'),
  destinyMatrix: media('matrix_destiny'),
  runes: media('runes'),
  numerology: media('numer'),
  dream: media('sonnik'),
  iching: media('ci'),
  lenormand: media('lenorman'),
  chakra: media('chakras'),
  transits: media('planet'),
  synastry: media('sinastr'),
  lunar: media('moon'),
  crystals: media('crystal'),
  rituals: media('ritual'),
  horary: media('horar'),
  solarReturn: media('solar'),
  karmic: media('karma'),
  mandala: media('mandala'),
  preloader: media('circle'),
} as const;
