module.exports = {
    data: { name: 'remove' },

    async execute(interaction) {
        const { message, member } = interaction;

        const originalDescription = message.embeds[0].description.split('.')[0] + '.';

        const RSVPArray = message.embeds[0].description.split('- ').splice(1).map(item => item.trim()).filter(item => item !== member.displayName);

        message.embeds[0].description = originalDescription;
        message.embeds[0].description += `\n\n**Current attendees: ${RSVPArray.length}**\n`;
        message.embeds[0].description += RSVPArray.length ? ' - ' + RSVPArray.join('\n - ') : ':smiling_face_with_tear:';
        message.edit({ embeds: [message.embeds[0]], components: [message.components[0]] });

        return interaction.deferUpdate();
    },
};