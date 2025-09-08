import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED, SOURCES } from '../bot.constants';
import { formatMilliseconds, paginate } from '../utils';

@Injectable()
export class QueueCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'queue',
    description: 'Show track queue',
  })
  async queue(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('The bot is not running.')],
      });
    }

    const tracks = player.queue.tracks;
    const track = player.queue.current;

    const sourceInfo = SOURCES[track?.info.sourceName];

    const currentTrackEmbed = track
      ? MAIN_EMBED()
          .setTitle(track.info.title)
          .setAuthor({ name: 'Currently playing' })
          .setDescription(track.info.author)
          .setURL(track.info.uri)
          .setThumbnail(track.info.artworkUrl)
          .addFields(
            {
              name: 'Duration',
              value: `${formatMilliseconds(player.lastPosition)} of ${formatMilliseconds(track.info.duration)}`,
              inline: true,
            },
            {
              name: '\u200B',
              value: '\u200B',
              inline: true,
            },
          )
          .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl })
      : MAIN_EMBED()
          .setAuthor({ name: 'Currently playing' })
          .setDescription('Nothing is playing right now.');

    if (!tracks.length) {
      const embed = MAIN_EMBED()
        .setAuthor({ name: 'Track queue' })
        .setDescription("There're no tracks.");

      return interaction.editReply({ embeds: [currentTrackEmbed, embed] });
    }

    const trackPerPage = 10;
    const totalPages = Math.ceil(tracks.length / trackPerPage);

    const pages = [...Array(totalPages)].map((_, index) => {
      const startIndex = index * trackPerPage;
      const endIndex = startIndex + trackPerPage;
      const pageTracks = tracks.slice(startIndex, endIndex);

      return MAIN_EMBED()
        .setAuthor({ name: 'Track queue' })
        .setDescription(
          pageTracks
            .map(
              (track, i) =>
                `${startIndex + i + 1}. [**${track.info.title} by ${track.info.author}**](${track.info.uri})`,
            )
            .join('\n'),
        )
        .setFooter({
          text: `Page: ${index + 1}/${totalPages}  •  Total tracks: ${tracks.length}`,
        });
    });

    await paginate({ interaction, pages, otherEmbeds: [currentTrackEmbed] });
  }
}
