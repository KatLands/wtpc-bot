const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { token, targetChannel, guildId, targetMemberOne, targetMemberTwo, targetMemberThree, meetingDay, meetingTime } = require('./config.json');
const CronJob = require('cron').CronJob;

const getRandomQuestion = require('./features/getRandomQuestion.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
});


// slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    const guild = client.guilds.cache.get(guildId);
    const { commandName, options } = interaction;
    const memberCount = guild.memberCount;

    if (commandName == 'ping') {
        await interaction.reply({ content: 'I\'m alive!' });
    }
    else if (commandName == 'question') {
        const questionEmbed = await getRandomQuestion(options.getSubcommand());
        await interaction.reply({ embeds: [questionEmbed] });
    }
    else if (commandName == 'server') {
        await interaction.reply(`WTPC Current Member Count: ${memberCount}`);
    }
});


/*
cron job format =  '* * * * * *'
sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/


// rsvp day before meeting message
const dayBeforeReminder = new CronJob('1 12 * * 4', function() {
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
        .setTitle('Club meeting this Friday at 7pm')
        .addFields({
            name: '\u200B',
            value: 'Click the accept button to RSVP to the meeting.\nClick the decline button to remove yourself from the RSVP list.',
        })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [dayBeforeMsg], components: [row] });

});


// tracking rsvp button clicks
const rsvpArray = [];
client.on('interactionCreate', interaction => {
    if (interaction.isButton()) {
        if (interaction.customId == 'accept') {
            if (rsvpArray.includes(interaction.member.displayName)) {
                client.channels.cache.get(targetChannel).send(`You have already confirmed ${interaction.member.displayName}! See you ${meetingDay} at ${meetingTime}.\nThis message will automatically delete.`).then(msg => { setTimeout(() => msg.delete(), 10000);});
                return interaction.deferUpdate();
            }
            else {
                rsvpArray.push(interaction.member.displayName);
                client.channels.cache.get(targetChannel).send(`Thank you for confirming ${interaction.member.displayName}! See you ${meetingDay} at ${meetingTime}.\nThis message will automatically delete.`).then(msg => { setTimeout(() => msg.delete(), 10000);});
                return interaction.deferUpdate();
            }
        }
        else if (interaction.customId == 'decline') {
            for (let i = 0; i < rsvpArray.length; i++) {
                if (rsvpArray[i] == (interaction.member.displayName)) {
                    rsvpArray.splice(i, 1);
                    client.channels.cache.get(targetChannel).send(`You have been removed from the RSVP list ${interaction.member.displayName}.\nThis message will automatically delete.`).then(msg => { setTimeout(() => msg.delete(), 10000);});
                    return interaction.deferUpdate();
                }
            }
            client.channels.cache.get(targetChannel).send(`You were not on the RSVP list ${interaction.member.displayName}.\nThis message will automatically delete.`).then(msg => { setTimeout(() => msg.delete(), 10000);});
            return interaction.deferUpdate();
        }
    }
});

// client.cache.get(targetMemberOne).send('RSVP List: ' + rsvpArray);
// sending DM with RSVP list
const sendRSVPArray = new CronJob('1 15 * * 5', function() {
    client.users.fetch(targetMemberOne, false).then((user) => {
        user.send('RSVP List:\n- ' + rsvpArray.join('\n - '));
    });
    client.users.fetch(targetMemberTwo, false).then((user) => {
        user.send('RSVP List:\n- ' + rsvpArray.join('\n - '));
    });
    client.users.fetch(targetMemberThree, false).then((user) => {
        user.send('RSVP List:\n- ' + rsvpArray.join('\n - '));
    });
});


// meeting start reminder
const meetingStart = new CronJob('58 18 * * 5', function() {
    const mtgStartMsg = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Club meeting starting now.')
        .addFields({ name: '\u200B', value: 'Join General Voice Chat' })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [mtgStartMsg] });
});


// purging rsvp array
const purgeRsvpList = new CronJob('1 21 * * 5', function() {
    rsvpArray.length = 0;
});


// start cron tasks
dayBeforeReminder.start();
sendRSVPArray.start();
meetingStart.start();
purgeRsvpList.start();


client.login(token);
