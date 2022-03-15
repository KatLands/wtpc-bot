const { MessageEmbed } = require('discord.js'),
    CronJob = require('cron').CronJob,
    { targetChannel } = require('../config.json'),
    Users = require('../models/users.js'),
    getLeaderboardGraph = require('../utilities/getLeaderboardGraph.js'),
    sequelize = require('../utilities/db');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(0-11), day of week(0-6 starting with sunday)
*/

// 1 11 * * 1
const weeklyLeaderboardResults = (client) => new CronJob('1 11 * * 1', async function() {
    const count = await sequelize.query('SELECT COUNT(*) FROM Users;');
    if (count[0][0]['COUNT(*)'] > 0) {
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
    }
    else {
        client.channels.cache.get(targetChannel).send('Want to help your club? We are looking for new top contributors. Start by using the <:award:905616817102413825> emoji today!');
    }
});

// 0 11 20 4,11 *
const resetLeaderboard = (client) => new CronJob('0 11 20 4,11 *', async function() {
    try {
        await sequelize.query('DELETE FROM Users;');
        client.channels.cache.get(targetChannel).send('Leaderboard reset.');
    }
    catch (error) {
        console.error(error);
    }
});

module.exports = {
    weeklyLeaderboardResults,
    resetLeaderboard,
};
