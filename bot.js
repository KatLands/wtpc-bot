const { Client, Collection, Intents } = require('discord.js'),
    fs = require('fs'),
    { token } = require('./config.json'),
    { dayBeforeReminder, meetingStart, purgeRSVPList } = require('./tasks/tasks.js');

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

    const { message, member } = interaction;

    if (interaction.customId === 'add') {
        RSVPArray.add(member.displayName);
        message.embeds[0].description = 'Click buttons below to add / remove yourself from RSVP list\n\n';
        message.embeds[0].description += `**Current attendees: ${RSVPArray.size}**\n`;
        message.embeds[0].description += RSVPArray.size ? '- ' + [...RSVPArray].join('\n - ') : ':smiling_face_with_tear:';
        message.edit({ embeds: [message.embeds[0]], components: [message.components[0]] });
        return interaction.deferUpdate();
    }
    else if (interaction.customId === 'remove') {
        RSVPArray.delete(member.displayName);
        message.embeds[0].description = 'Click buttons below to add / remove yourself from RSVP list\n\n';
        message.embeds[0].description += `**Current attendees: ${RSVPArray.size}**\n`;
        message.embeds[0].description += RSVPArray.size ? '- ' + [...RSVPArray].join('\n - ') : ':smiling_face_with_tear:';
        message.edit({ embeds: [message.embeds[0]], components: [message.components[0]] });
        return interaction.deferUpdate();
    }
});

// Start cron tasks
dayBeforeReminder(client).start();
meetingStart(client).start();
purgeRSVPList(RSVPArray).start();

client.login(token);