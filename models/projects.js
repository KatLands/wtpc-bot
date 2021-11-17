const Sequelize = require('sequelize'),
    sequelize = require('../utilities/db.js');

const Projects = sequelize.define('projects', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    projectName: Sequelize.STRING,
    contactInfo: Sequelize.STRING,
    description: Sequelize.STRING(1250),
});

module.exports = Projects;