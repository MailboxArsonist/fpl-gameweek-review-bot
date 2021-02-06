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
        player_id: player.id,
        minutes: player.minutes,
        status: player.status,
    }));

    

    players.forEach(player => {
        knex('player')
            .where('player_id', '=', player.player_id)
            .first()
            .then(row => {

                const dataToUpdate = {};

                // only update if their team, status or minutes have changed
                if(row.team_id !== player.team_id) {
                    dataToUpdate.team_id = player.team_id;
                }

                if(row.status !== player.status) {
                    dataToUpdate.status = player.status;
                }

                if(row.minutes !== player.minutes) {
                    dataToUpdate.minutes = player.minutes;
                }

                if(Object.keys(dataToUpdate).length > 0){
                    knex('player')
                        .where('player_id', '=', player.player_id)
                        .update(dataToUpdate)
                        .then(() => {
                            console.log(`Player: ${player.player_id}, (${player.web_name}) updated`);
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }

            })
            .catch(err => {
                console.error(err);
            });
    });
})();