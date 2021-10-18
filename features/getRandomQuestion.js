const { MessageEmbed } = require('discord.js'),
	axios = require('axios'),
	randInt = require('../utilities/randInt.js');

const getRandomQuestion = async (difficulty) => {
	const hashMap = { easy: [0, 2], medium: [1, 5], hard: [2, 2], harder: [3, 0] };
	const [difficultyID, maxPage] = hashMap[difficulty];

	const { data } = await axios.get(
		`https://binarysearch.com/api/questionlist?page=${randInt(0, maxPage)}&difficulty=${difficultyID}`,
	);
	const randomQuestion = data.questions[Math.floor(Math.random() * data.questions.length)];

	const { data: randomQuestionData } = await axios.get(
		`https://binarysearch.com/api/questionlist/${randomQuestion.id}`,
	);
	const { title, slug, attempted, solved, solutionExplanation, content } = randomQuestionData;

	const solutionString = solutionExplanation
		? `**Tap to reveal solution**\n\n||${solutionExplanation}||`
		: '';

	const questionEmbed = new MessageEmbed()
		.setTitle(title)
		.setURL(`https://binarysearch.com/problems/${slug}`)
		.setDescription(`**${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}**\n\n${content}\n\n${solutionString}`)
		.addFields(
			{ name: 'Attempted', value: attempted.toString(), inline: true },
			{ name: 'Solved', value: solved.toString(), inline: true },
			{ name: 'Rate', value: `${((solved / attempted) * 100).toFixed(2)}%`, inline: true },
		)
		.setImage('https://i.imgur.com/tgpifKA.png')
		.setTimestamp();

	return questionEmbed;
};

module.exports = getRandomQuestion;
