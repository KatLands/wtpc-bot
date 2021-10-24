// Send a message that only lasts 10 seconds
const sendTempMessage = async (interaction, messageText) => {
    const message = await interaction.channel.send(messageText);
    setTimeout(() => message.delete(), 10000);
};

module.exports = sendTempMessage;