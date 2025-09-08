import {
  LavalinkManagerContextOf,
  NodeManagerContextOf,
  OnLavalinkManager,
  OnNodeManager,
  PlayerManagerService,
} from '@necord/lavalink';
import { Injectable, Logger } from '@nestjs/common';
import { Collection, GuildManager } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { MAIN_EMBED } from './bot.constants';

@Injectable()
export class BotService {
  constructor(
    private guildManager: GuildManager,
    private playerManager: PlayerManagerService,
  ) {}

  private logger = new Logger(BotService.name);

  private timeouts = new Collection<string, NodeJS.Timeout>();

  @Once('clientReady')
  onClientReady(@Context() [client]: ContextOf<'clientReady'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  onWarn(@Context() [info]: ContextOf<'warn'>) {
    this.logger.warn(info);
  }

  @On('error')
  onError(@Context() [error]: ContextOf<'error'>) {
    this.logger.error(error);
  }

  @OnNodeManager('connect')
  onReadyLavalink(@Context() [node]: NodeManagerContextOf<'connect'>) {
    this.logger.log(`Node: ${node.options.id} connected`);
  }

  @OnLavalinkManager('playerCreate')
  onPlayerCreate(@Context() [player]: LavalinkManagerContextOf<'playerCreate'>) {
    this.logger.log(`Player created at ${player.guildId}`);
  }

  @OnLavalinkManager('playerDestroy')
  onPlayerDestroy(@Context() [player]: LavalinkManagerContextOf<'playerDestroy'>) {
    this.logger.log(`Player destroyed at ${player.guildId}`);

    const timeout = this.timeouts.get(player.guildId);

    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(player.guildId);
    }
  }

  @OnLavalinkManager('trackStart')
  onTrackStart(@Context() [player]: LavalinkManagerContextOf<'trackStart'>) {
    const timeout = this.timeouts.get(player.guildId);

    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(player.guildId);
    }
  }

  @OnLavalinkManager('queueEnd')
  onQueueEnd(@Context() [player]: LavalinkManagerContextOf<'queueEnd'>) {
    const timeout = this.timeouts.get(player.guildId);

    if (timeout) this.timeouts.delete(player.guildId);

    const newTimeout = setTimeout(async () => {
      await player.destroy();

      const guild = this.guildManager.cache.get(player.guildId);

      const textChannel = guild.channels.cache.get(player.textChannelId);

      if (!textChannel.isTextBased()) return;

      const embed = MAIN_EMBED().setDescription(
        'No tracks have played in the last 5 minutes - bot disabled.',
      );

      await textChannel.send({ embeds: [embed] });
    }, 300000);

    this.timeouts.set(player.guildId, newTimeout);
  }

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(@Context() [oldState, newState]: ContextOf<'voiceStateUpdate'>) {
    const voiceChannel = oldState.channel ?? newState.channel;

    const voiceChannelMembers = voiceChannel.members.filter((member) => !member.user.bot);

    if (!voiceChannelMembers.size) {
      const player = this.playerManager.get(voiceChannel.guildId);

      if (!player || voiceChannel.id !== player.voiceChannelId) return;

      await player.destroy();
    }
  }
}
