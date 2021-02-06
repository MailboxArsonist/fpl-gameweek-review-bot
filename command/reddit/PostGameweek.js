const snoowrap = require('snoowrap');
const knex = require('../../config/database');
const argv = require('minimist')(process.argv.slice(2));
const { title, body } = require('../../content.json');
const EventEmitter = require('events').EventEmitter;
const Event = new EventEmitter();
const { PLAYER_MINIMUM_MINUTES, PLAYER_STATUS_OK, PLAYER_STATUS_MINOR } = require('../../constants/playerStatus');
require('dotenv').config();

class CreateGameweek {
    /**
     * @param {string} gwTitle - the base title for the post
     * @param {string} gwBody - the base body (post content) for the post
     */
    constructor(gwTitle, gwBody) {
        this.initRedditWrapper();
        this.initEventHandlers();
        this.gameweekId = argv.gw;
        this.title = gwTitle;
        this.body = gwBody;

    }

    /**
     * inits events
     */
    initEventHandlers() {
        Event.on('team.start', this.handleTeamSubmission);
        Event.on('team.done', this.handleTeamSubmission);
    }

    /**
     * inits the reddit snoowrap wrapper
     */
    initRedditWrapper() {
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
    async postGameweek() {
        const { post_id } = await this.getGameweek(this.gameweekId);
        const fixtures = await this.getFixturesWithTeams(this.gameweekId);

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
        this.fetchedSubmission = await submission.fetch();

        // store the post ID
        this.setGameweekRedditPost(this.gameweekId, this.fetchedSubmission.id);

        // get and set teams with players
        this.mappedTeamsWithPlayers = await this.mapTeamsAndPlayers(fixtures);

        // emit start event
        Event.emit('team.start', 0);
    }

    /**
     * posts the team to GW post then replies to with each player, reddit ratelimit of 10 ish seconds per post, hence the timeout
     * @param {object} team - the team
     * @param {array} players - the players
     * @param {int} index - current index of team
     */
    postTeam({team, players}, index) {

        setTimeout(() => {

            // post the comment of team name
            this.fetchedSubmission.reply(team.name).then(comment => {
                console.log(`Starting team: ${team.name}`);

                // loop the players for this team and post each one
                players.forEach((player, i) => {    
                    setTimeout(() => {
                        comment.reply(player.web_name).then(() => {

                            if(i === players.length - 1){
                                Event.emit('team.done', index + 1);
                                console.log(`Finished team: ${team.name}`);
                            }
                        });
        
                    }, (i * 5000));
                });
            });
            
        }, 5000);
    }

    /**
     * Sets the GW row with reddit submission ID
     * @param {int} gameweekId - id of the gameweek
     * @param {string} postId - id of the post
     */
    setGameweekRedditPost(gameweekId, postId) {
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
    getGameweek(gameweekId) {
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
    getFixturesWithTeams(gameweekId) {
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
                    // flatten the teams
                    resolve(rows.reduce((arr, row) => {
                        arr.push({
                            name: row.home_name,
                            id: row.home_id
                        });
                        arr.push({
                            name: row.away_name,
                            id: row.away_id
                        });
                        return arr;
                    }, []));
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    /**
     * gets the players that play for this team, criteria is > 90 mins played this season (will need to find a better solution for start of next season) also filter out the injured players
     * @returns {promise}
     * @param {object} team - the player plays for this team
     */
    getPlayersByTeam(team) {
        return new Promise ((resolve, reject) => {
            knex('player')
                .select(
                    'web_name',
                    'team_id'
                )
                .where('team_id', '=', team.id)
                .whereIn('status', [ PLAYER_STATUS_OK, PLAYER_STATUS_MINOR ])
                .andWhere('minutes', '>=', PLAYER_MINIMUM_MINUTES)
                .then(players => {
                    resolve({
                        team,
                        players,
                    });
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    /**
     * @returns {promise}
     * @param {array} teams - current teams of this GW
     */
    async mapTeamsAndPlayers(teams){
        return Promise.all(teams.map(team => this.getPlayersByTeam(team)))
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

    /**
     * Handles team submission event
     * @param {int} index - the index of current team iteration
     * @returns {bool}
     */
    handleTeamSubmission(index) {
        if(index < this.mappedTeamsWithPlayers.length) {
            this.postTeam(this.mappedTeamsWithPlayers[index], index);
            return true;
        }
        console.log(`Finished, ${this.mappedTeamsWithPlayers.length} teams posted`);
        return false;
    }
}

const currentGameweek = new CreateGameweek(title, body);
currentGameweek.postGameweek();
