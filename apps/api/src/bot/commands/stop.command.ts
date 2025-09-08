import { PlayerManagerService } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

@Injectable()
export class StopCommand {
  constructor(private playerManager: PlayerManagerService) {}

  @SlashCommand({
    name: 'stop',
    description: 'Clear the track queue and the disable bot',
  })
  async stop(@Context() [interaction]: SlashCommandContext) {
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

    await player.destroy();

    const embed = MAIN_EMBED().setDescription('The track queue cleared and the bot is disabled.');

    await interaction.editReply({ embeds: [embed] });
  }
}
