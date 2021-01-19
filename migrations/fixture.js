const knex = require('../config/database');

knex.schema.createTable('fixture', (table) => {
    table.increments('id');
    table.integer('fixture_id');
    table.integer('gameweek_id');
    table.integer('home_team_id');
    table.integer('away_team_id');
    table.datetime('kickoff_time');
}).then(() => {
    console.log("fixture table created");
})
.catch((err) => { console.log(err); throw err })
.finally(() => {
    knex.destroy();
});