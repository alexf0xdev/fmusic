import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';
import { formatMilliseconds, timeToMilliseconds } from '../utils';

export class SeekCommandOptions {
  @StringOption({
    name: 'time',
    description: 'Time for seek (in 0:00 format)',
    required: true,
    min_length: 1,
    max_length: 8,
  })
  time: string;
}

@Injectable()
export class SeekCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'seek',
    description: 'Seek a track',
  })
  async seek(
    @Context() [interaction]: SlashCommandContext,
    @Options() { time }: SeekCommandOptions,
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
    const track = player.queue.current;

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Nothing is playing right now.')],
      });
    }

    if (!track.info.isSeekable) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription("The track can't be seek.")],
      });
    }

    const position = timeToMilliseconds(time);

    if (isNaN(position)) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Incorrect time value.')],
      });
    }

    if (position > track.info.duration) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('The track is shorter than the specified time.')],
      });
    }

    await player.seek(position);

    const embed = MAIN_EMBED().setDescription(
      `Track [**${track.info.title} by ${track.info.author}**](${track.info.uri}) is now **${formatMilliseconds(position)}** of **${formatMilliseconds(track.info.duration)}**.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
