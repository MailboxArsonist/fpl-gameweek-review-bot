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

    initRedditWrapper(){
        this.redditWrapper = new snoowrap({
            userAgent: process.env.REDDIT_USERAGENT,
            clientId: process.env.REDDIT_APP,
            clientSecret: process.env.REDDIT_SECRET,
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD
        });
    }

    async postGameweek(){
        const gw = await this.getGameweek(this.gameweekId);
        const formattedTitle = this.title.replace('%GW%', this.gameweekId).replace('%SEASON%', '(2019/2020)');

        this.redditWrapper.getSubreddit('test').submitSelfpost({
            title: formattedTitle,
            text: this.gwBody,
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
