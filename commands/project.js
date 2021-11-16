const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project')
        .setDescription('View or add projects')
        .addSubcommand((subcommand) =>
            subcommand.setName('add').setDescription('Add a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter a project name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('contact')
                        .setDescription('Enter project lead contact-information')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Enter brief project description')
                        .setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('view').setDescription('View all WTPC projects'),
        ),

    async execute(interaction) {
        const projectName = interaction.options.getString('name');
        const contactInfo = interaction.options.getString('contact');
        const description = interaction.options.getString('description');
        const subCommand = interaction.options.getSubcommand();

        const addProject = new MessageEmbed()
            .setColor('#0080ff')
            .setTitle('Project successfully added:')
            .setDescription(`**Project Name:** ${projectName}\n**Contact Information:** ${contactInfo} \n**Description:** ${description}** **`);

        const viewProjects = new MessageEmbed ()
            .setColor('#0080ff')
            .setTitle('WTPC Active Projects')
            .setDescription(`**Project Name:** ${projectName}\n**Contact Information:** ${contactInfo} \n**Description:** ${description}** **`);

        await interaction.reply({ embeds: [subCommand === 'add' ? addProject : viewProjects] });

    },
};

