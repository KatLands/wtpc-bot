const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { token, targetChannel, targetMemberOne, targetMemberTwo, targetMemberThree, meetingDay, meetingTime } = require('./config.json');
const sendTempMessage = require('./utilities/sendTempMessage.js');
const CronJob = require('cron').CronJob;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});

// Slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

/*
cron job format =  '* * * * * *'
sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
*/


// rsvp day before meeting message
const dayBeforeReminder = new CronJob('20 20 * * 6', function() {
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
        .addFields({
            name: 'Meeting this Friday at 7pm',
            value: 'Click the accept button to RSVP or use the decline button to remove yourself from the list.',
        })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [dayBeforeMsg], components: [row] });

});

// tracking rsvp button clicks
const rsvpArray = [];
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { displayName } = interaction.member;

    if (interaction.customId === 'accept') {
        if (rsvpArray.includes(displayName)) {
            sendTempMessage(interaction, `You have already confirmed ${displayName}! See you ${meetingDay} at ${meetingTime}.`);
            return interaction.deferUpdate();
        }
        rsvpArray.push(displayName);
        sendTempMessage(interaction, `Thank you for confirming ${displayName}! See you ${meetingDay} at ${meetingTime}.`);
        return interaction.deferUpdate();
    }
    else if (interaction.customId === 'decline') {
        for (let i = 0; i < rsvpArray.length; i++) {
            if (rsvpArray[i] === displayName) {
                rsvpArray.splice(i, 1);
                sendTempMessage(interaction, `You have been removed from the RSVP list ${displayName}.`);
                return interaction.deferUpdate();
            }
        }
        sendTempMessage(interaction, `You were not on the RSVP list ${displayName}.`);
        return interaction.deferUpdate();
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
        .addFields({ name: 'Meeting starting now', value: 'Join general chat' })
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(targetChannel,
    ).send({ embeds: [mtgStartMsg] });
});


// purging rsvp array
const purgeRsvpList = new CronJob('1 21 * * 5', function() {
    rsvpArray.length = 0;
    /*
	client.channels.cache.get(targetChannel,
	).send('List purged. Should show empty array: ' + rsvpArray);
	*/
});


// start cron tasks
dayBeforeReminder.start();
sendRSVPArray.start();
meetingStart.start();
purgeRsvpList.start();


client.login(token);
