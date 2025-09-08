import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

@Injectable()
export class PreviousCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'previous',
    description: 'Play previous track',
  })
  async previous(@Context() [interaction]: SlashCommandContext) {
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

    const track = await player.queue.shiftPrevious();

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('There is no previous track.')],
      });
    }

    await player.play({ clientTrack: track });

    const embed = MAIN_EMBED().setDescription(
      `Track [**${track.info.title} by ${track.info.author}**](${track.info.uri}) replayed.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
