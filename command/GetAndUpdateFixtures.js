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

    mappedFixtures.forEach(fixture => {
        knex('fixture')
            .where('fixture_id', '=', fixture.fixture_id)
            .first()
            .then(row => {

                const dataToUpdate = {};

                // only update if their GW or kickoff time has changed, in theory if the GW has changed so has the kickoff time
                if(row.gameweek_id !== fixture.gameweek_id) {
                    dataToUpdate.gameweek_id = fixture.gameweek_id;
                }

                if(new Date(row.kickoff_time).getTime() !== fixture.kickoff_time.getTime()) {
                    dataToUpdate.kickoff_time = fixture.kickoff_time;
                }

                if(Object.keys(dataToUpdate).length > 0){
                    knex('fixture')
                        .where('fixture_id', '=', fixture.fixture_id)
                        .update(dataToUpdate)
                        .then(() => {
                            console.log(`Fixture: ${fixture.fixture_id}, updated from ${row.kickoff_time} to ${fixture.kickoff_time}`);
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