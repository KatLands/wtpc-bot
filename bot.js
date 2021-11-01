const { Client, Collection, Intents } = require('discord.js'),
    fs = require('fs'),
    Users = require('./models/users.js'),
    { token } = require('./config.json'),
    { dayBeforeReminder, meetingStart, purgeRSVPList } = require('./tasks/tasks.js');


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'REACTION'],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
    client.user.setActivity('WTPC');

    Users.sync();
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    if (reaction.emoji.name === 'custom_crown' && reaction.count === 1) {
        const foundUser = await Users.findOne({ where: { username: reaction.message.author.username } });

        if (foundUser) {
            foundUser.increment('points', { by: 5 });
            reaction.message.channel.send(`Congrats ${foundUser.username}, you just earned 5 points! (Total points: ${foundUser.points + 5})`);
        }
        else {
            const newUser = await Users.create({ username: reaction.message.author.username });
            reaction.message.channel.send(`Congrats ${newUser.username}, you just earned 5 points! (Total points: ${newUser.points})`);
        }
    }
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

    const { customId, message, member } = interaction;

    if (customId === 'add') {
        RSVPArray.add(member.displayName);
        message.embeds[0].description = 'Click buttons below to add / remove yourself from RSVP list\n\n';
        message.embeds[0].description += `**Current attendees: ${RSVPArray.size}**\n`;
        message.embeds[0].description += RSVPArray.size ? '- ' + [...RSVPArray].join('\n - ') : ':smiling_face_with_tear:';
        message.edit({ embeds: [message.embeds[0]], components: [message.components[0]] });
        return interaction.deferUpdate();
    }
    else if (customId === 'remove') {
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