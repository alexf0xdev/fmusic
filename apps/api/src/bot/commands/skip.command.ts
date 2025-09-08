import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

@Injectable()
export class SkipCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'skip',
    description: 'Skip track in queue',
  })
  async skip(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply();

    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('The bot is not running.')],
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Join the channel with the bot.')],
      });
    }

    const currentTrack = player.queue.current;

    if (!currentTrack) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription("There're no more tracks in the queue.")],
      });
    }

    const nextTrack = player.queue.tracks[player.queue.tracks.length - 1];

    nextTrack ? await player.skip() : await player.stopPlaying();

    const embed = MAIN_EMBED().setDescription(
      `Track [**${currentTrack.info.title} by ${currentTrack.info.author}**](${currentTrack.info.uri}) skipped in the queue.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
