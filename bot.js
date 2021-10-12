const { Client, Intents } = require("discord.js");
const CronJob = require("cron").CronJob;

const getRandomQuestion = require("./utils.js");
const { token } = require("./config.json");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS],
});

client.on("ready", () => {
  console.log(`Logged in: ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName == "ping") {
    await interaction.reply("I'm alive!");
  } else if (commandName == "questioneasy") {
    const embeddedQuestion = await getRandomQuestion(0);
    await interaction.channel.send({ embeds: [embeddedQuestion] });
  } else if (commandName == "questionmedium") {
    const embeddedQuestion = await getRandomQuestion(1);
    await interaction.channel.send({ embeds: [embeddedQuestion] });
  } else if (commandName == "questionhard") {
    const embeddedQuestion = await getRandomQuestion(2);
    await interaction.channel.send({ embeds: [embeddedQuestion] });
  } else if (commandName == "questionveryhard") {
    const embeddedQuestion = await getRandomQuestion(3);
    await interaction.channel.send({ embeds: [embeddedQuestion] });
  }
});

// '* * * * * *'
// sec(0-59), min(0-59), hour(0-23), day of month(1-31), month(1-12), day of week(0-6 starting with sunday)
const task = new CronJob("42 13 * * 1", function (targetChannel) {
  console.log("console test");
  client.channels.cache.get(targetChannel).send("channel test");
});

client.login(token);
