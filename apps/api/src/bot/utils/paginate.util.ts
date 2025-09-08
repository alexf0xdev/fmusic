import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';

export const paginate = async ({
  interaction,
  pages,
  otherEmbeds,
  timeout = 300000,
}: {
  interaction: ChatInputCommandInteraction<CacheType>;
  pages: EmbedBuilder[];
  otherEmbeds?: EmbedBuilder[];
  timeout?: number;
}) => {
  let currentPage = 1;

  const buttons = [
    new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('◀️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('▶️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentPage === pages.length),
  ];

  let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

  const message = await interaction.editReply({
    embeds: [...otherEmbeds, pages[currentPage - 1]],
    components: [row],
  });

  const collector = message.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    time: timeout,
  });

  collector.on('collect', async (i) => {
    switch (i.customId) {
      case 'previous':
        currentPage--;
        break;
      case 'next':
        currentPage++;
        break;
    }

    buttons[0].setDisabled(currentPage === 1);
    buttons[1].setDisabled(currentPage === pages.length);

    row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    await i.update({
      embeds: [...otherEmbeds, pages[currentPage - 1]],
      components: [row],
    });

    collector.resetTimer();
  });

  collector.on('end', (_) => {
    message.edit({ components: [] }).catch(() => null);
  });

  return message;
};
