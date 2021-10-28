const { Client, Collection, Intents } = require('discord.js'),
    fs = require('fs'),
    { token } = require('./config.json'),
    { dayBeforeReminder, sendRSVPArray, meetingStart, purgeRSVPList } = require('./tasks/tasks.js');

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
const RSVPArray = new Set();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { displayName } = interaction.member;

    if (interaction.customId === 'accept') {
        interaction.message.embeds[0].fields = [];
        RSVPArray.add(displayName);
        interaction.message.embeds[0].addFields({ name: `Current attendees: ${RSVPArray.size}`, value: RSVPArray.size ? 'RSVP List:\n- ' + [...RSVPArray].join('\n - ') : ':smiling_face_with_tear:' });
        interaction.message.edit({ embeds: [interaction.message.embeds[0]], components: [interaction.message.components[0]] });
        return interaction.deferUpdate();
    }
    else if (interaction.customId === 'decline') {
        interaction.message.embeds[0].fields = [];
        RSVPArray.delete(displayName);
        interaction.message.embeds[0].addFields({ name: `Current attendees: ${RSVPArray.size}`, value: RSVPArray.size ? 'RSVP List:\n- ' + [...RSVPArray].join('\n - ') : ':smiling_face_with_tear:' });
        interaction.message.edit({ embeds: [interaction.message.embeds[0]], components: [interaction.message.components[0]] });
        return interaction.deferUpdate();
    }
});

client.login(token);

// Start cron tasks
dayBeforeReminder(client).start();
sendRSVPArray(client, RSVPArray).start();
meetingStart(client).start();
purgeRSVPList(RSVPArray).start();