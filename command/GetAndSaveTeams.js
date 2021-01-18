const { FplClient } = require('../FplClient');
const knex = require('../config/database');

(async function() {
    //get players from fpl api
    const { teams } = await FplClient.getBootstrap();

    const mappedTeams = teams.map(team => ({
        team_id: team.id,
        name: team.name,
        short_name: team.short_name
    }));
    
    knex('team')
        .insert(mappedTeams)
        .then(() => {
            console.log(`${mappedTeams.length} teams inserted`)
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            knex.destroy();
        });
})();