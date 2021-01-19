const { FplClient } = require('../FplClient');
const knex = require('../config/database');

(async function() {
    //get fixtures from fpl api
    const fixtures = await FplClient.getFixtures();
    const mappedFixtures = fixtures.map(fixture => ({
        fixture_id: fixture.id,
        gameweek_id: fixture.event,
        home_team_id: fixture.team_h,
        away_team_id: fixture.team_a,
        kickoff_time: new Date(fixture.kickoff_time)
    }));
    
    knex('fixture')
        .insert(mappedFixtures)
        .then(() => {
            console.log(`${mappedFixtures.length} fixtures inserted`)
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            knex.destroy();
        });
})();
