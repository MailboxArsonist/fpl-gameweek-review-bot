const snoowrap = require('snoowrap');
const knex = require('../../config/database');
const argv = require('minimist')(process.argv.slice(2));
const { title, body } = require('../../content.json');
require('dotenv').config();

class CreateGameweek {
    /**
     * @param {string} gwTitle - the base title for the post
     * @param {string} gwBody - the base body (post content) for the post
     */
    constructor(gwTitle, gwBody) {
        this.initRedditWrapper();
        this.gameweekId = argv.gw;
        this.title = gwTitle;
        this.body = gwBody;
    }

    /**
     * inits the reddit snoowrap wrapper
     */
    initRedditWrapper(){
        this.redditWrapper = new snoowrap({
            userAgent: process.env.REDDIT_USERAGENT,
            clientId: process.env.REDDIT_APP,
            clientSecret: process.env.REDDIT_SECRET,
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD
        });
    }

    /**
     * post the gameweek onto subreddit
     */
    async postGameweek(){
        const { post_id } = await this.getGameweek(this.gameweekId);
        const fixtures = await this.getFixturesWithTeams(this.gameweekId);
        console.log(fixtures);

        // check if its already been posted to reddit.
        if(post_id !== null) {
            throw new Error(`GW ${this.gameweekId} has already been posted on subreddit with the ID: ${post_id}`);
        }

        const formattedTitle = this.title.replace('%GW%', this.gameweekId).replace('%SEASON%', '(2020/2021)');

        // post onto subreddit
        const submission = await this.redditWrapper.getSubreddit('fpl_test_bot').submitSelfpost({
            title: formattedTitle,
            text: this.body,
        })

        // fetch the posted submission, need to do this to get the ID
        const fetchedSubmission = await submission.fetch();

        // store the post ID
        this.setGameweekRedditPost(this.gameweekId, fetchedSubmission.id);

        fixtures.forEach(fixture => {
            const { away_name, away_id, home_name, home_id } = fixture;
            const home_players = this.getPlayersByTeam(home_id);
            const away_players = this.getPlayersByTeam(away_id);

            Promise.all([home_players, away_players]).then(([homePlayers, awayPlayers]) => {
                console.log(homePlayers);
                console.log(awayPlayers);
                // post home team
                fetchedSubmission.reply(home_name).then(comment => {
                    console.log(comment);
                });
            });
        });
    }

    setGameweekRedditPost(gameweekId, postId){
        knex('gameweek')
            .where('gameweek_id', '=', gameweekId)
            .update({ 'post_id': postId })
            .catch(err => {
                console.error(err);
            });
    }

    /**
     * @returns {promise}
     * @param {int} gameweekId - id of the gameweek
     */
    getGameweek(gameweekId){
        return new Promise ((resolve, reject) => {
            knex('gameweek')
                .where('gameweek_id', '=', gameweekId)
                .first()
                .then(row => {
                    resolve(row);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    /**
     * @returns {promise}
     * @param {int} gameweekId - id of the gameweek
     */
    getFixturesWithTeams(gameweekId){
        return new Promise ((resolve, reject) => {
            knex('fixture')
                .select(
                    'away_team.name AS away_name',
                    'away_team.team_id AS away_id',
                    'home_team.name AS home_name',
                    'home_team.team_id AS home_id',
                )
                .leftJoin('team as home_team', 'home_team.team_id', 'fixture.home_team_id')
                .leftJoin('team as away_team', 'away_team.team_id', 'fixture.away_team_id')
                .where('gameweek_id', '=', gameweekId)
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    /**
     * @returns {promise}
     * @param {int} teamId - id of the team
     */
    getPlayersByTeam(teamId){
        return new Promise ((resolve, reject) => {
            knex('player')
                .select(
                    'web_name',
                    'team_id'
                )
                .where('team_id', '=', teamId)
                .then(rows => {
                    resolve(rows);
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }
    
    /**
     * gets current season based on GW date
     * @param {Date} firstGWDate - first gameweek date
     * @param {Date} lastGWDate - last gameweek date
     * @returns {string}
     */
    getCurrentSeason(firstGWDate, lastGWDate){
        return `(${firstGWDate.getFullYear()}/${lastGWDate.getFullYear()})`;
    }
}

const currentGameweek = new CreateGameweek(title, body);
currentGameweek.postGameweek();
