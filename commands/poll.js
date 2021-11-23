const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Setup a custom poll')
        .addStringOption((option) =>
            option.setName('question')
                .setDescription('Enter question')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('choices')
                .setDescription('Enter choices separated by comma'),
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const choices = interaction.options.getString('choices') ? interaction.options.getString('choices').split(',') : [];

        const alphabet = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];

        let choicesString = '';

        for (let i = 0; i < choices.length; i++) {
            choicesString += alphabet[i] + '  ' + choices[i] + '\n\n';
        }

        const pollEmbed = new MessageEmbed()
            .setColor('#0080ff')
            .setTitle(`🦧  ${question}`)
            .setDescription(choicesString);

        const message = await interaction.reply({
            embeds: [pollEmbed],
            fetchReply: true,
        });

        try {
            for (let i = 0; i < choices.length; i++) {
                await message.react(alphabet[i]);
            }

            if (choices.length === 0) {
                await message.react('👍');
                await message.react('👎');
            }
        }
        catch (error) {
            console.error('One of the emojis failed to react:', error);
        }
    },
};
