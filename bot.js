const { Client, Collection, Intents, MessageEmbed } = require('discord.js'),
    fs = require('fs'),
    Users = require('./models/users.js'),
    Projects = require('./models/projects.js'),
    { token, welcomeChannel } = require('./config.json'),
    { weeklyLeaderboardResults, resetLeaderboard } = require('./tasks/tasks.js');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'REACTION'],
});

client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`);
    client.user.setPresence({ activities: [{ name: 'Type /help in any channel for FAQ\'s' }], status: 'online' });

    Users.sync();
    Projects.sync();
});

client.on('guildMemberAdd', member => {
    const welcomeMessage = new MessageEmbed()
        .setColor('#0080ff')
        .setTitle('Welcome to the Wake Tech Programming Club!')
        .setDescription('•    The announcements channel is where you will find important club updates.\n•    The club meets every other Tuesday at 6pm.\n•     Check out the Events tab on the top left for more information on club meetings.\n•    We have many help channels available based on language.\n•    Type /project in any channel to see more information about club projects.\n•    Type /help in any channel for more server information.\n•    We\'re glad to have you here! Please remember to fill out the forms mentioned in the welcome landing page.')
        .setImage(
            'https://www.waketech.edu/themes/custom/talon/assets/images/wake-tech-2017.png',
        );

    client.channels.cache.get(welcomeChannel,
    ).send(member.toString());
    client.channels.cache.get(welcomeChannel,
    ).send({ embeds: [welcomeMessage] });
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

    if (!reaction.message.guild.me.permissionsIn(reaction.message.channel).has('SEND_MESSAGES')) return;

    if (reaction.emoji.name === 'award' && reaction.message.author.id !== user.id) {
        const foundUser = await Users.findOne({ where: { username: reaction.message.author.username } });

        if (foundUser) {
            foundUser.increment('points', { by: 5 });
            reaction.message.channel.send(`Congrats <@${reaction.message.author.id}>, <@${user.id}> just awarded you 5 points! (Total points: ${foundUser.points + 5})`);
        }
        else {
            const newUser = await Users.create({ username: reaction.message.author.username });
            reaction.message.channel.send(`Congrats <@${reaction.message.author.id}>,  <@${user.id}> just awarded you 5 points! (Total points: ${newUser.points})`);
        }
    }
});

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

client.buttons = new Collection();

const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    client.buttons.set(button.data.name, button);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);

    if (!button) return;

    try {
        await button.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.deferUpdate();
    }
});

// Start cron tasks
weeklyLeaderboardResults(client).start();
resetLeaderboard(client).start();
// dayBeforeReminder(client).start();
// meetingStart(client).start();

client.login(token);