import { EmbedBuilder } from 'discord.js';
import { SourceNames } from 'lavalink-client';

export const SOURCES: Partial<Record<SourceNames, { name: string; iconUrl: string }>> = {
  youtube: {
    name: 'YouTube',
    iconUrl: 'https://drive.google.com/uc?id=1xT26cRDc1-AsjV6934bsJroWFqS4HOxp',
  },
  spotify: {
    name: 'Spotify',
    iconUrl: 'https://drive.google.com/uc?id=1v0NICbMzLENX7YnaA1rctOrc1a29krpx',
  },
  soundcloud: {
    name: 'SoundCloud',
    iconUrl: 'https://drive.google.com/uc?id=1tNUZye8IRlMUObxQpjsf34x2s2NpmpI9',
  },
  yandexmusic: {
    name: 'Yandex Music',
    iconUrl: 'https://drive.google.com/uc?id=1FSvEs7PrM3IK5qJr9K17mo910JZwJKm4',
  },
  vkmusic: {
    name: 'VKontakte',
    iconUrl: 'https://drive.google.com/uc?id=1nICE_PC7sH0dxrPSvBiCgcBHQSITsy2q',
  },
};

export const MAIN_EMBED = () => new EmbedBuilder().setColor('#f8ae25');

export const ERROR_EMBED = () =>
  new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'Error' });
