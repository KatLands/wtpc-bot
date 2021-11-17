const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    Projects = require('../models/projects.js');

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

        const projectEmbed = new MessageEmbed().setColor('#0080ff');

        if (subCommand === 'add') {
            await Projects.create({ projectName, contactInfo, description });

            projectEmbed
                .setTitle('Project successfully added:')
                .setDescription(`**Project name:** ${projectName}\n**Contact information:** ${contactInfo} \n**Description:** ${description}** **`);
        }
        else {
            const projects = await Projects.findAll({ });

            const projectsToDisplay = projects.map(project =>
                '**Project name:** ' + project.dataValues.projectName + '\n' +
                '**Contact information:** ' + project.dataValues.contactInfo + '\n' +
                '**Description:** ' + project.dataValues.description + '\n\n',
            );

            projectEmbed
                .setTitle('WTPC Active Projects')
                .setDescription(projectsToDisplay.join(''));
        }

        await interaction.reply({ embeds: [projectEmbed] });
    },
};

