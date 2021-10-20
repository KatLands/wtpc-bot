const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { token, targetChannel, targetMemberOne, targetMemberTwo, targetMemberThree } = require('./config.json');
const CronJob = require('cron').CronJob;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});


client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
});


// Slash commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

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
const dayBeforeReminder = new CronJob('1 12 * * 4', function() {
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

// Button custom IDS
client.buttons = new Collection();
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.name, button);
}

client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);

    if (!button) return;

    button.execute(interaction);
});

const { rsvpArray } = require('./buttons/rsvp.js');

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
