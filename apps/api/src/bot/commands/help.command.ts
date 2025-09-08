import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { MAIN_EMBED } from '../bot.constants';

@Injectable()
export class HelpCommand {
  @SlashCommand({
    name: 'help',
    description: 'Help by commands',
  })
  async help(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = MAIN_EMBED()
      .setAuthor({ name: 'Help by commands' })
      .setDescription(
        '</play:1374107913802743910> - find a track/playlist by link/title\n</stop:1374107913802743911> - clear the track queue and the disable bot\n</pause:1374107913802743912> - pause/unpause a track\n</queue:1374107913802743916> - show track queue\n</skip:1374107913802743913> - skip track in queue\n</previous:1374107913802743914> - play previous track\n</remove:1375077063249104967> - remove track from queue\n</seek:1387130053808361545> - seek a track',
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
