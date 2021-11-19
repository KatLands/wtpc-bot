const Users = require('../models/users.js');

const getLeaderboardGraph = async () => {
    const users = await Users.findAll({ limit: 5, order: [['points', 'DESC']] });

    const chart = {
        type: 'bar',
        options: {
            title: {
                display: true,
                text: `Top ${users.length} Contributors`,
            },
            scales: {
                xAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Club Members',
                            fontStyle: 'bold',
                        },
                    },
                ],
                yAxes: [
                    {
                        scaleLabel: {
                            display: true,
                            labelString: 'Points',
                            fontStyle: 'bold',
                        },
                    },
                ],
            },
        },
        data: {
            labels: [],
            datasets: [{
                label: 'Points',
                data: [],
            }],
        },
    };

    for (const user of users) {
        chart.data.labels.push(user.dataValues.username);
        chart.data.datasets[0].data.push(user.dataValues.points);
    }

    chart.data.datasets[0].data.push(0);

    const encodedChart = encodeURIComponent(JSON.stringify(chart));
    const chartUrl = `https://quickchart.io/chart?bkg=%23FFFFFF&c=${encodedChart}`;

    return chartUrl;
};

module.exports = getLeaderboardGraph;