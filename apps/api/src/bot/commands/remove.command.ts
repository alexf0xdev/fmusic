import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, IntegerOption, Options, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

export class RemoveCommandOptions {
  @IntegerOption({
    name: 'track_id',
    description: 'Track ID from queue',
    required: true,
    min_value: 1,
    max_value: 200,
  })
  trackId: number;
}

@Injectable()
export class RemoveCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'remove',
    description: 'Remove track from queue',
  })
  async remove(
    @Context() [interaction]: SlashCommandContext,
    @Options() { trackId }: RemoveCommandOptions,
  ) {
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

    const index = trackId - 1;

    const track = player.queue.tracks[index];

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Track not found.')],
      });
    }

    await player.queue.remove(index);

    const embed = MAIN_EMBED().setDescription(
      `Track [**${track.info.title} by ${track.info.author}**](${track.info.uri}) removed from the queue.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
