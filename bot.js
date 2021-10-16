const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { token, targetChannel, guildId, targetMemberOne, targetMemberTwo, targetMemberThree } = require('./config.json');
const CronJob = require('cron').CronJob;

const getRandomQuestion = require('./utils.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const guild = client.guilds.cache.get(guildId);
    const memberCount = guild.memberCount;

    if (commandName == 'ping') {
        await interaction.reply('I\'m alive!');
    }
    else if (commandName == 'question') {
        if (interaction.options.getSubcommand() === 'easy') {
            const embeddedQuestion = await getRandomQuestion(0);
            await interaction.reply({ embeds: [embeddedQuestion] });
        }
        else if (interaction.options.getSubcommand() === 'medium') {
            const embeddedQuestion = await getRandomQuestion(1);
            await interaction.reply({ embeds: [embeddedQuestion] });
        }
        else if (interaction.options.getSubcommand() === 'hard') {
            const embeddedQuestion = await getRandomQuestion(2);
            await interaction.reply({ embeds: [embeddedQuestion] });
        }
        else if (interaction.options.getSubcommand() === 'veryhard') {
            const embeddedQuestion = await getRandomQuestion(3);
            await interaction.reply({ embeds: [embeddedQuestion] });
        }
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
const dayBeforeReminder = new CronJob('38 18 * * 6', function() {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('rsvp')
                .setLabel('RSVP')
                .setStyle('SUCCESS'),
        );

    const dayBeforeMsg = new MessageEmbed()
        .setColor('#0080ff')
        .addFields({
            name: 'Meeting this Friday at 7pm',
            value: 'Click button below to RSVP',
        })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [dayBeforeMsg], components: [row] });

});

const meetingStart = new CronJob('58 18 * * 5', function() {
    const mtgStartMsg = new MessageEmbed()
        .setColor('#0080ff')
        .addFields({ name: 'Meeting starting now', value: 'Join general chat' })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel).send({ embeds: [mtgStartMsg] });
});

// tracking rsvp button clicks
const rsvpArray = [];
client.on('interactionCreate', interaction => {
    if (interaction.isButton()) {
        if (rsvpArray.includes(interaction.member.displayName)) {
            return;
        }
        else {
            rsvpArray.push(interaction.member.displayName);
            return interaction.deferUpdate();
        }
    }
});


// client.cache.get(targetMemberOne).send('RSVP List: ' + rsvpArray);
// sending DM with RSVP list
const sendRSVPArray = new CronJob('39 18 * * 6', function() {
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

// purging rsvp array
const purgeRsvpList = new CronJob('1 21 * * 5', function() {
    rsvpArray.length = 0;
    client.channels.cache.get(targetChannel,
    ).send('List purged');
    client.channels.cache.get(targetChannel,
    ).send('Should show empty array: ' + rsvpArray);
});

// start cron tasks
dayBeforeReminder.start();
sendRSVPArray.start();
meetingStart.start();
purgeRsvpList.start();

client.login(token);