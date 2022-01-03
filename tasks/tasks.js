const { MessageEmbed } = require('discord.js'),
    CronJob = require('cron').CronJob,
    { targetChannel } = require('../config.json'),
    Users = require('../models/users.js'),
    getLeaderboardGraph = require('../utilities/getLeaderboardGraph.js');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/

// Weekly leaderboard post
const weeklyLeaderboardResults = (client) => new CronJob('0 11 * * 1', async function() {
    try {
        const chartUrl = await getLeaderboardGraph();

        const users = await Users.findAll({ limit: 5, order: [['points', 'DESC']] });
        const emojiSquare = ':white_small_square: ';

        let description = '';

        for (const user of users) {
            description += emojiSquare + user.dataValues.username + '\n';
        }

        const leaderboardResults = new MessageEmbed().setColor('#0080ff').setTitle('Weekly Leaderboard Results').setDescription(`Congratulations to the top ${users.length} contributors!\n\n${description}`).setImage(chartUrl);

        client.channels.cache.get(targetChannel,
        ).send({ embeds: [leaderboardResults] });
    }
    catch (error) {
        console.error(error);
    }
});

// RSVP day before meeting message
// const dayBeforeReminder = (client) => new CronJob('1 12 * * 1', function() {
//     const row = new MessageActionRow()
//         .addComponents(
//             new MessageButton()
//                 .setCustomId('add')
//                 .setLabel('Add')
//                 .setStyle('SUCCESS'),
//             new MessageButton()
//                 .setCustomId('remove')
//                 .setLabel('Remove')
//                 .setStyle('DANGER'),
//         );

//     const dayBeforeMsg = new MessageEmbed()
//         .setColor('#0080ff')
//         .setTitle('Club meeting this Tuesday at 6pm')
//         .setDescription('Click buttons below to add / remove yourself from RSVP list** **')
//         .setImage(
//             'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
//         );

//     client.channels.cache.get(targetChannel,
//     ).send({ embeds: [dayBeforeMsg], components: [row] });

// });

// Meeting start reminder
// const meetingStart = (client) => new CronJob('58 17 * * 2', function() {
//     const mtgStartMsg = new MessageEmbed()
//         .setColor('#0080ff')
//         .setTitle('Club meeting starting now')
//         .setDescription('Join General Voice Chat')
//         .setImage(
//             'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
//         );

//     client.channels.cache.get(targetChannel,
//     ).send({ embeds: [mtgStartMsg] });
// });

module.exports = {
    weeklyLeaderboardResults,
    // dayBeforeReminder,
    // meetingStart,
};