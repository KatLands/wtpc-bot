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
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('update').setDescription('Edit a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter name of project to update')
                        .setRequired(true),
                )
                .addStringOption(option =>
                    option.setName('new-name')
                        .setDescription('Enter new name of project'),
                )
                .addStringOption(option =>
                    option.setName('new-contact')
                        .setDescription('Enter new contact information of project'),
                )
                .addStringOption(option =>
                    option.setName('new-description')
                        .setDescription('Enter new description of project'),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('delete').setDescription('Delete a WTPC project')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter name of project to delete')
                        .setRequired(true),
                ),
        ),

    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        const projectEmbed = new MessageEmbed().setColor('#0080ff');

        if (subCommand === 'add') {
            const projectName = interaction.options.getString('name');
            const contactInfo = interaction.options.getString('contact');
            const description = interaction.options.getString('description');

            await Projects.create({ projectName, contactInfo, description });

            projectEmbed
                .setTitle('Project Successfully Added')
                .setDescription(`**Project name:** ${projectName}\n**Contact information:** ${contactInfo} \n**Description:** ${description}** **`);
        }
        else if (subCommand === 'view') {
            const projects = await Projects.findAll({ });

            const projectsToDisplay = projects.map(project =>
                '**Project name:** ' + project.dataValues.projectName + '\n' +
                '**Contact information:** ' + project.dataValues.contactInfo + '\n' +
                '**Description:** ' + project.dataValues.description + '\n\n',
            );

            projectEmbed.setTitle('WTPC Active Projects').setDescription(projectsToDisplay.join(''));
        }
        else if (subCommand === 'update') {
            const projectName = interaction.options.getString('name');
            const newProjectName = interaction.options.getString('new-name');
            const newContactInfo = interaction.options.getString('new-contact');
            const newDescription = interaction.options.getString('new-description');

            const foundProject = await Projects.findOne({ where: { projectName } });

            if (foundProject) {
                foundProject.projectName = newProjectName || foundProject.projectName;
                foundProject.contactInfo = newContactInfo || foundProject.contactInfo;
                foundProject.description = newDescription || foundProject.description;

                const savedProject = await foundProject.save();

                projectEmbed
                    .setTitle(`Project ${projectName} Successfully Updated`)
                    .setDescription(`**Project name:** ${savedProject.dataValues.projectName}\n**Contact information:** ${savedProject.dataValues.contactInfo} \n**Description:** ${savedProject.dataValues.description}** **`);
            }
            else {
                projectEmbed
                    .setTitle('Could Not Find Project')
                    .setDescription('We couldn\'t find a project with that given name. Please double check to make sure it matches exactly!');
            }
        }
        else if (subCommand === 'delete') {
            const projectName = interaction.options.getString('name');

            const foundProject = await Projects.findOne({ where: { projectName } });

            if (foundProject) {
                await Projects.destroy({ where: { projectName } });

                projectEmbed
                    .setTitle(`Project ${projectName} Successfully Deleted`)
                    .setDescription('Project removed');
            }
            else {
                projectEmbed
                    .setTitle('Could Not Find Project')
                    .setDescription('We couldn\'t find a project with that given name. Please double check to make sure it matches exactly!');
            }
        }

        await interaction.reply({ embeds: [projectEmbed] });
    },
};

