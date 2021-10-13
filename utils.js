const { MessageEmbed } = require("discord.js");
const axios = require("axios");

// Get a random number between min and max (inclusive)
const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = getRandomQuestion = async (difficulty) => {
  // Set difficultyString for the embed message output
  // Set maxPage value for fetching questions from API
  switch (difficulty) {
    case 0:
      maxPage = 2;
      difficultyString = "Easy";
      break;
    case 1:
      maxPage = 5;
      difficultyString = "Medium";
      break;
    case 2:
      maxPage = 2;
      difficultyString = "Hard";
      break;
    case 3:
      maxPage = 0;
      difficultyString = "Very Hard";
      break;
  }

  console.log(
    `https://binarysearch.com/api/questionlist?page=${randomIntFromInterval(
      1,
      maxPage
    )}&difficulty=${difficulty}`
  );

  // Fetch questions from binarysearch
  const { data } = await axios.get(
    `https://binarysearch.com/api/questionlist?page=${randomIntFromInterval(
      0,
      maxPage
    )}&difficulty=${difficulty}`
  );

  // Get a random question
  const randomQuestion =
    data.questions[Math.floor(Math.random() * data.questions.length)];

  const { data: randomQuestionData } = await axios.get(
    `https://binarysearch.com/api/questionlist/${randomQuestion.id}`
  );

  const questionEmbed = new MessageEmbed()
    .setTitle(randomQuestion.title)
    .setURL(`https://binarysearch.com/problems/${randomQuestion.slug}`)
    // .setDescription(
    //   `Binary Search Question #${randomQuestion.id}\nDifficulty: ${difficultyString}\nLink: https://binarysearch.com/problems/${randomQuestion.slug}`
    // )
    .setDescription(randomQuestionData.content)
    .setImage("https://i.imgur.com/tgpifKA.png")
    .setTimestamp()
    .setFooter(
      "Question from Binarysearch.com",
      "https://i.imgur.com/tgpifKA.png"
    );

  return questionEmbed;
};