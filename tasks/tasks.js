const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js'),
    CronJob = require('cron').CronJob,
    { targetChannel, targetMemberOne, targetMemberTwo, targetMemberThree } = require('../config.json');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/


// RSVP day before meeting message
const dayBeforeReminder = (client) => new CronJob('1 15 * * 5', function() {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('accept')
                .setLabel('Accept')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('decline')
                .setLabel('Decline')
                .setStyle('DANGER'),
        );


    const dayBeforeMsg = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Meeting this Friday at 7pm')
        .setDescription('Click the accept button to RSVP or use the decline button to remove yourself from the list.')
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [dayBeforeMsg], components: [row] });

});

// Sending DM with RSVP list
const sendRSVPArray = (client, RSVPArray) => new CronJob('1 15 * * 5', function() {
    client.users.fetch(targetMemberOne, false).then((user) => {
        user.send('RSVP List:\n- ' + [...RSVPArray].join('\n - '));
    });
    client.users.fetch(targetMemberTwo, false).then((user) => {
        user.send('RSVP List:\n- ' + [...RSVPArray].join('\n - '));
    });
    client.users.fetch(targetMemberThree, false).then((user) => {
        user.send('RSVP List:\n- ' + [...RSVPArray].join('\n - '));
    });
});


// Meeting start reminder
const meetingStart = (client) => new CronJob('58 18 * * 5', function() {
    const mtgStartMsg = new MessageEmbed()
        .setColor('#0080ff')
        .addFields({ name: 'Meeting starting now', value: 'Join general chat' })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [mtgStartMsg] });
});


// Purging RSVP array
const purgeRSVPList = (RSVPArray) => new CronJob('1 21 * * 5', function() {
    RSVPArray.clear();
    /*
	client.channels.cache.get(targetChannel,
	).send('List purged. Should show empty array: ' + RSVPArray);
	*/
});

module.exports = {
    dayBeforeReminder,
    sendRSVPArray,
    meetingStart,
    purgeRSVPList,
};