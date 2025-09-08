import { NecordLavalinkModule } from '@necord/lavalink';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActivityType, IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { BotService } from './bot.service';
import Commands from './commands';

@Module({
  imports: [
    NecordModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.getOrThrow<string>('BOT_TOKEN'),
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildVoiceStates,
        ],
        development:
          configService.get<string>('NODE_ENV', 'development') === 'development'
            ? [configService.get<string>('BOT_DEV_GUILD_ID')]
            : false,
        presence: {
          activities: [{ name: '/help', type: ActivityType.Listening }],
        },
      }),
    }),
    NecordLavalinkModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ids = configService.getOrThrow<string>('LAVALINK_IDS').split(';');
        const hosts = configService.getOrThrow<string>('LAVALINK_HOSTS').split(';');
        const ports = configService.getOrThrow<string>('LAVALINK_PORTS').split(';');
        const passwords = configService.getOrThrow<string>('LAVALINK_PASSWORDS').split(';');

        return {
          nodes: ids.map((id, index) => ({
            id,
            host: hosts[index],
            port: +ports[index],
            authorization: passwords[index],
            secure: true,
          })),
        };
      },
    }),
  ],
  providers: [BotService, ...Commands],
})
export class BotModule {}
