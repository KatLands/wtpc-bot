const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js'),
    CronJob = require('cron').CronJob,
    { targetChannel } = require('../config.json');

/*
Cron job format =  '* * * * * *'
Sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/


// RSVP day before meeting message
const dayBeforeReminder = (client) => new CronJob('1 12 * * 4', function() {
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


    const dayBeforeMsg = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Club meeting this Friday at 7pm')
        .setDescription('Click buttons below to add / remove yourself from RSVP list')
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [dayBeforeMsg], components: [row] });

});


// Meeting start reminder
const meetingStart = (client) => new CronJob('58 18 * * 5', function() {
    const mtgStartMsg = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Club meeting starting now')
        .setDescription('Join General Voice Chat')
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [mtgStartMsg] });
});


// Purging RSVP array
const purgeRSVPList = (RSVPArray) => new CronJob('1 21 * * 5', function() {
    RSVPArray.clear();
    console.log(RSVPArray);
});

module.exports = {
    dayBeforeReminder,
    meetingStart,
    purgeRSVPList,
};