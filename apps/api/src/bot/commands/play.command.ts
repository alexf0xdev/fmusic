import { NecordLavalinkService, PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, SlashCommandContext, StringOption } from 'necord';
import { ERROR_EMBED, MAIN_EMBED, SOURCES } from '../bot.constants';
import { formatMilliseconds } from '../utils';

export class PlayCommandOptions {
  @StringOption({
    name: 'query',
    description: 'Link/title of track/playlist',
    required: true,
    max_length: 500,
  })
  query: string;

  @StringOption({
    name: 'source',
    description: 'Source for track/playlist search',
    choices: [
      { name: 'YouTube', value: 'youtube' },
      { name: 'Spotify', value: 'spotify' },
      { name: 'SoundCloud', value: 'soundcloud' },
      { name: 'Yandex Music', value: 'yandexmusic' },
      { name: 'VKontakte', value: 'vkmusic' },
    ],
  })
  source: 'youtube' | 'spotify' | 'soundcloud' | 'yandexmusic' | 'vkmusic';
}

@Injectable()
export class PlayCommand {
  constructor(
    private playerManager: PlayerManagerService,
    private lavalinkService: NecordLavalinkService,
  ) {}

  @SlashCommand({
    name: 'play',
    description: 'Find a track/playlist by link/title',
  })
  async play(
    @Context() [interaction]: SlashCommandContext,
    @Options() { query, source }: PlayCommandOptions,
  ) {
    await interaction.deferReply();

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.voice.channel) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Join the channel.')],
      });
    }

    try {
      let player = this.playerManager.get(interaction.guild.id);

      if (!player) {
        player = this.playerManager.create({
          ...this.lavalinkService.extractInfoForPlayer(interaction),
          selfDeaf: true,
          selfMute: false,
          volume: +(process.env.BOT_VOLUME ?? 40),
        });
      }

      if (player.voiceChannelId !== member.voice.channelId) {
        return interaction.editReply({
          embeds: [ERROR_EMBED().setDescription('Join the channel with the bot.')],
        });
      }

      const result = await player.search({ query, source }, member.id);

      if (!result || !result.tracks?.length) {
        return interaction.editReply({
          embeds: [ERROR_EMBED().setDescription('Track not found.')],
        });
      }

      const tracksWithAdded = player.queue.tracks.length + result.tracks.length;

      if (tracksWithAdded > 200) {
        return interaction.editReply({
          embeds: [ERROR_EMBED().setDescription('The track limit exceeded.')],
        });
      }

      const track = result.tracks[0];
      const playlist = result.playlist;

      const isPlaylist = result.loadType === 'playlist';

      await player.queue.add(isPlaylist ? result.tracks : track);

      await player.connect();

      if (!player.playing) await player.play();

      const sourceInfo = SOURCES[track.info.sourceName];

      const embed = isPlaylist
        ? MAIN_EMBED()
            .setTitle(playlist.title)
            .setAuthor({ name: 'Playlist added' })
            .setDescription(playlist.author)
            .setURL(playlist.uri)
            .setThumbnail(playlist.thumbnail)
            .addFields(
              {
                name: 'Duration',
                value: formatMilliseconds(playlist.duration),
                inline: true,
              },
              {
                name: 'Added to queue',
                value: `${result.tracks.length + 1}`,
                inline: true,
              },
            )
            .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl })
        : MAIN_EMBED()
            .setTitle(track.info.title)
            .setAuthor({ name: 'Track added' })
            .setDescription(track.info.author)
            .setURL(track.info.uri)
            .setThumbnail(track.info.artworkUrl)
            .addFields(
              {
                name: 'Duration',
                value: formatMilliseconds(track.info.duration),
                inline: true,
              },
              {
                name: 'In queue',
                value: `${player.queue.tracks.length + 1}`,
                inline: true,
              },
            )
            .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          ERROR_EMBED().setDescription('An error has occurred. The source may not be supported.'),
        ],
      });
    }
  }
}
