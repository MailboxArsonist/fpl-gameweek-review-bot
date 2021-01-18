const knex = require('../config/database');

knex.schema.createTable('team', (table) => {
    table.increments('id');
    table.string('name');
    table.integer('team_id');
    table.string('short_name');
}).then(() => {
    console.log("team table created");
})
.catch((err) => { console.log(err); throw err })
.finally(() => {
    knex.destroy();
});