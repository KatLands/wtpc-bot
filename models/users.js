const Sequelize = require('sequelize'),
    sequelize = require('../utilities/db.js');

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: Sequelize.STRING,
    points: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
    },
});

module.exports = Users;