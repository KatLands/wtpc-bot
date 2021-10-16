const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const codingQuestionCommand = new SlashCommandBuilder()
    .setName('question')
    .setDescription('Get a randomized coding question based on difficulty')
    .addSubcommand((subcommand) =>
        subcommand.setName('easy').setDescription('Get an easy question'),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('medium').setDescription('Get a medium question'),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('hard').setDescription('Get a hard question'),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('veryhard').setDescription('Get a very hard question'),
    );

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with I\'m alive!'),
    codingQuestionCommand,
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest
    .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
