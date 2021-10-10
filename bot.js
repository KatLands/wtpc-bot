const {Client, Intents} = require('discord.js');
const {token} = require('./config.json');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS],
});


client.on('ready', () => {
    console.log(`Logged in: ${client.user.tag}`)
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const {commandName} = interaction;

    if (commandName == 'ping') {
        await interaction.reply("I'm alive!");
    }

});


client.login(token);