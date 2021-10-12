const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = getRandomQuestion = async (difficulty) => {
  switch (difficulty) {
    case 0:
      maxPage = 3;
      difficultyString = "Easy";
      break;
    case 1:
      maxPage = 6;
      difficultyString = "Medium";
      break;
    case 2:
      maxPage = 3;
      difficultyString = "Hard";
      break;
    case 3:
      maxPage = 1;
      difficultyString = "Very Hard";
      break;
  }

  console.log(
    `https://binarysearch.com/api/questionlist?page=${randomIntFromInterval(
      1,
      maxPage
    )}&difficulty=${difficulty}`
  );

  const { data } = await axios.get(
    `https://binarysearch.com/api/questionlist?page=${randomIntFromInterval(
      1,
      maxPage
    )}&difficulty=${difficulty}`
  );

  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];

  const questionEmbed = new MessageEmbed()
    .setTitle(randomQuestion.title)
    .setURL(`https://binarysearch.com/problems/${randomQuestion.slug}`)
    .setDescription(
      `Binary Search Question #${randomQuestion.id}\nDifficulty: ${difficultyString}\nLink: https://binarysearch.com/problems/${randomQuestion.slug}`
    )
    .setImage("https://i.imgur.com/tgpifKA.png")
    .setTimestamp()
    .setFooter(
      "Question from Binarysearch.com",
      "https://i.imgur.com/tgpifKA.png"
    );

  return questionEmbed;
};
