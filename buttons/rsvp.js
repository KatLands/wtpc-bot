const { targetChannel, meetingDay, meetingTime } = require('../config.json');

const rsvpArray = [];

module.exports = {
    name: 'rsvp',
    rsvpArray,

    async execute(interaction) {
        if (rsvpArray.includes(interaction.member.displayName)) {
            return;
        }
        else {
            rsvpArray.push(interaction.member.displayName);
            interaction.client.channels.cache.get(targetChannel).send(`Thank you for confirming ${interaction.member.displayName}! See you ${meetingDay} at ${meetingTime}.`).then(msg => { setTimeout(() => msg.delete(), 10000);});
            return interaction.deferUpdate();
        }
    },
};