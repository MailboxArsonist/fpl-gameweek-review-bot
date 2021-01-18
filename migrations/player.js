const knex = require('../config/database');

knex.schema.createTable('player', (table) => {
    table.increments('id');
    table.string('first_name');
    table.string('second_name');
    table.string('web_name');
    table.integer('team_id');
    table.integer('player_id');
}).then(() => {
    console.log("player table created");
})
.catch((err) => { console.log(err); throw err })
.finally(() => {
    knex.destroy();
});