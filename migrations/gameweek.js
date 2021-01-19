const knex = require('../config/database');

knex.schema.createTable('gameweek', (table) => {
    table.increments('id');
    table.string('name');
    table.integer('gameweek_id');
    table.datetime('deadline_time');
}).then(() => {
    console.log("gameweek table created");
})
.catch((err) => { console.log(err); throw err })
.finally(() => {
    knex.destroy();
});