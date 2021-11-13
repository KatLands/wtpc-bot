const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    axios = require('axios'),
    randInt = require('../utilities/randInt.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('question')
        .setDescription('Get a randomized coding question based on difficulty')
        .addSubcommand((subcommand) =>
            subcommand.setName('easy').setDescription('Get an easy question'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('medium').setDescription('Get a medium question'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('hard').setDescription('Get a hard question'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('harder').setDescription('Get a harder question'),
        ),

    async execute(interaction) {
        const difficulty = interaction.options.getSubcommand();

        const hashMap = { easy: [0, 2], medium: [1, 5], hard: [2, 2], harder: [3, 0] };
        const [difficultyID, maxPage] = hashMap[difficulty];

        const { data } = await axios.get(
            `https://binarysearch.com/api/questionlist?page=${randInt(0, maxPage)}&difficulty=${difficultyID}`,
        );
        const randomQuestion = data.questions[Math.floor(Math.random() * data.questions.length)];

        const { data: randomQuestionData } = await axios.get(
            `https://binarysearch.com/api/questionlist/${randomQuestion.id}`,
        );

        const { title, slug, attempted, solved, solutionExplanation, content, topics, hints, testcases, inputParameters } = randomQuestionData;

        let testcasesString = '';
        for (let i = 0; i < testcases.length; i++) {
            testcasesString += `\n**Example ${i + 1}**`;
            testcasesString += '\n```Input: ';

            for (let j = 0; j < testcases[i].input.length; j++) {
                testcasesString += j === testcases[i].input.length - 1 ? `${inputParameters[j]} = ` + JSON.stringify(testcases[i].input[j]) : `${inputParameters[j]} = ` + JSON.stringify(testcases[i].input[j]) + ', ';
            }

            testcasesString += ' ```';

            testcasesString += ' ```Output: ';

            if (!testcases[i].expectedOutput.isArray) {
                testcasesString += JSON.stringify(testcases[i].expectedOutput) + ' ```';
            }
            else {
                for (let j = 0; j < testcases[i].expectedOutput.length; j++) {
                    testcasesString += j === testcases[i].expectedOutput.length - 1 ? JSON.stringify(testcases[i].expectedOutput[j]) + ' ```' : '```' + JSON.stringify(testcases[i].expectedOutput[j]) + ' ```';
                }
            }

            testcasesString += testcases[i].explanation && '\nExplanation: \n' + testcases[i].explanation ;
            testcasesString += i !== testcases.length - 1 && '\n';
        }
        testcasesString = testcasesString && '\n' + testcasesString;
        testcasesString = testcasesString.substring(0, testcasesString.length - 5);

        let topicsString = '';
        for (let i = 0; i < topics.length; i++) {
            topicsString += i === topics.length - 1 ? '||`' + topics[i].tag + '`||' : '||`' + topics[i].tag + '`|| ';
        }
        topicsString = topicsString && '\n\n**Topics**\n' + topicsString;

        let hintsString = '';
        for (let i = 0; i < hints.length; i++) {
            hintsString += `\n||- ${hints[i].content.charAt(0).toUpperCase() + hints[i].content.slice(1)}||`;
        }
        hintsString = hintsString && '\n\n**Hints**' + hintsString;

        const solutionString = solutionExplanation
            ? `\n\n**Solution**\n\n||${solutionExplanation}||`
            : '';

        const questionEmbed = new MessageEmbed()
            .setTitle(title)
            .setAuthor(difficulty.charAt(0).toUpperCase() + difficulty.slice(1))
            .setColor(difficulty === 'easy' ? 'GREEN' : difficulty === 'medium' ? 'YELLOW' : difficulty === 'hard' ? 'RED' : 'BLUE')
            .setURL(`https://binarysearch.com/problems/${slug}`)
            .setDescription(`${content}${testcasesString}${topicsString}${hintsString}${solutionString}`)
            .addFields(
                { name: 'Solved', value: solved.toString(), inline: true },
                { name: 'Attempted', value: attempted.toString(), inline: true },
                { name: 'Rate', value: `${((solved / attempted) * 100).toFixed(2)}%`, inline: true },
            )
            .setThumbnail('https://cdn.discordapp.com/attachments/832851230383800330/902397037633495090/binarySearch.png')
            .setTimestamp();

        console.log(testcasesString);

        await interaction.reply({ embeds: [questionEmbed] });
    },
};