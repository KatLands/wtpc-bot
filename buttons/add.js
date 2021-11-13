module.exports = {
    data: { name: 'add' },

    async execute(interaction) {
        const { message, member } = interaction;

        const originalDescription = message.embeds[0].description.split('** **')[0] + '** **';

        const RSVPArray = message.embeds[0].description.split(':white_small_square: ').splice(1).map(item => item.trim());

        if (!RSVPArray.includes(member.displayName)) {
            RSVPArray.push(member.displayName);
        }

        message.embeds[0].description = originalDescription;
        message.embeds[0].description += `\n\n**Current attendees: ${RSVPArray.length}**\n`;
        message.embeds[0].description += RSVPArray.length ? ' :white_small_square: ' + RSVPArray.join('\n :white_small_square: ') : ':smiling_face_with_tear:';
        message.edit({ embeds: [message.embeds[0]], components: [message.components[0]] });

        return interaction.deferUpdate();
    },
};