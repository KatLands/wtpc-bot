const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");

codingQuestionCommand = new SlashCommandBuilder()
  .setName("question")
  .setDescription("Get a randomized coding question based on difficulty")
  .addSubcommand((subcommand) =>
    subcommand.setName("easy").setDescription("Get an easy question")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("medium").setDescription("Get an medium question")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("hard").setDescription("Get an hard question")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("veryhard").setDescription("Get an very hard question")
  );

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with I'm alive!"),
  codingQuestionCommand,
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
