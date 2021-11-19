const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    getLeaderboardGraph = require('../utilities/getLeaderboardGraph.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows server leaderboard'),

    async execute(interaction) {
        const chartUrl = await getLeaderboardGraph();
        const chartEmbed = new MessageEmbed().setImage(chartUrl);

        await interaction.reply({ embeds: [chartEmbed] });
    },
};