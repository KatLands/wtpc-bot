const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with bot help'),

    async execute(interaction) {
        const helpEmbed = new MessageEmbed()
            .setColor('#0080ff')
            .setTitle('WTPC Bot Help/FAQ\'S')
            .setDescription('Find help with the WTPC bot and frequently asked questions here')
            .addField('\u200B', '\u200B')
            .setImage('https://www.wcpss.net/cms/lib/NC01911451/Centricity/Domain/5437/Picture2.png')
            .addFields(
                { name: 'Commands', value: 'Type / to see a list of all bot commands with description.' },
                { name: 'How do I interact with the bot?', value: 'All bot commands are run by using slash before the command. For example /commandNameHere' },
                { name: 'When does the club meet?', value: 'WTPC meets Tuesday at 6pm. Sometimes there will also be special meetings that members set up outside of our regurarly scheduled times. Check the `#special-meetings` channel for more information.' },
                { name: 'How can I get involved with club projects?', value: 'Use the `/project` view command to see contact information for all WTPC projects.' },
            )
            .addField('\u200B', '\u200B')
            .addField('Bot Commands: ', '\n`/ping` Confirms bot is up and running \n`/server` Responds with current server member count \n`/question(easy, meduim, or hard)` Returns question from binary search with varying difficulty \n`/leaderboard` Shows top five server conributors \n`/meeting` Set up a custom meeting using required date, time, topic and description fields \n`/poll` Set up a custom poll with either yes/no options or any number of poll reponse choices \n`/project` View, add, edit and remove offical club projects');
        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};