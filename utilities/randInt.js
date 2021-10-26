// Get a random number between min and max (inclusive)

const randInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = randInt;