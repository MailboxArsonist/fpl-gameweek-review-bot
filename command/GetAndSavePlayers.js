const { FplClient } = require('../FplClient');
const knex = require('../config/database');

(async function() {
    //get players from fpl api
    const { elements } = await FplClient.getBootstrap();

    const players = elements.map(player => ({
        web_name: player.web_name,
        first_name: player.first_name,
        second_name: player.second_name,
        team_id: player.team,
        player_id: player.id
    }));
    
    knex('player')
        .insert(players)
        .then(() => {
            console.log(`${players.length} players inserted`)
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            knex.destroy();
        });
})();