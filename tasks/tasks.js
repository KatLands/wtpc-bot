const { MessageEmbed } = require('discord.js'),
    CronJob = require('cron').CronJob,
    { targetChannel } = require('../config.json'),
    Users = require('../models/users.js'),
    getLeaderboardGraph = require('../utilities/getLeaderboardGraph.js');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/

const weeklyLeaderboardResults = (client) => new CronJob('1 11 * * 1', async function() {
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

const resetLeaderboard = (client) => new CronJob('0 11 20 4,11 *', async function() {
    try {
        Users.destroy({ truncate : true });
        client.channels.cache.get(targetChannel,
        ).send('Leaderboard reset.');
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = {
    weeklyLeaderboardResults,
    resetLeaderboard,
};