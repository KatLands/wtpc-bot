const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meeting')
        .setDescription('Set up a specialty meeting')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Enter a meeting date')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Enter a meeting time')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('Enter a meeting topic')
                .setRequired(true)),

    async execute(interaction) {
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');
        const topic = interaction.options.getString('topic');

        const specialtyMeetingSetUp = new MessageEmbed ()
            .setColor('#0080ff')
            .setTitle('Thank you for setting up a meeting')
            .setDescription(`**Date:** ${date}\n**Time:** ${time} \n**Topic:** ${topic}\n\nClick buttons below to add / remove yourself from RSVP list.`);

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('add')
                    .setLabel('Add')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('remove')
                    .setLabel('Remove')
                    .setStyle('DANGER'),
            );

        await interaction.reply({ embeds: [specialtyMeetingSetUp], components: [row] });
    },
};

