const { Client, Collection, Intents } = require('discord.js'),
    fs = require('fs'),
    { token, meetingDay, meetingTime } = require('./config.json'),
    { dayBeforeReminder, sendRSVPArray, meetingStart, purgeRsvpList } = require('./tasks/tasks.js'),
    sendTempMessage = require('./utilities/sendTempMessage.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});

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

// Tracking RSVP button clicks
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

// Start cron tasks
dayBeforeReminder(client).start();
sendRSVPArray(client, rsvpArray).start();
meetingStart(client).start();
purgeRsvpList(rsvpArray).start();

client.login(token);
