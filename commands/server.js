const { SlashCommandBuilder } = require('@discordjs/builders'),
    { guildId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with current server member count'),

    async execute(interaction) {
        const guild = interaction.client.guilds.cache.get(guildId);
        const memberCount = guild.memberCount;
        await interaction.reply(`WTPC Current Member Count: ${memberCount}`);
    },
};