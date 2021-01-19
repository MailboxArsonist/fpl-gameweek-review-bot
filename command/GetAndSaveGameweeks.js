const { FplClient } = require('../FplClient');
const knex = require('../config/database');

(async function() {
    //get gws from fpl api
    const { events } = await FplClient.getBootstrap();

    const gameweeks = events.map(event => ({
        gameweek_id: event.id,
        name: event.name,
        deadline_time: new Date(event.deadline_time)
    }));
    
    knex('gameweek')
        .insert(gameweeks)
        .then(() => {
            console.log(`${gameweeks.length} GWs inserted`)
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            knex.destroy();
        });
})();