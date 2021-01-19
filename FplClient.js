const https = require("https");

const FPL_SUMMARY_API_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";
const FPL_DETAIL_URL = "https://fantasy.premierleague.com/api/element-summary/{}/";
const FPL_HISTORY_URL = "https://fantasy.premierleague.com/api/entry/{}/history/";
const FPL_TEAM_URL = "https://fantasy.premierleague.com/api/entry/{}/event/{}/picks/";
const FPL_TEAM_TRANSFER_URL = "https://fantasy.premierleague.com/api/entry/{}/transfers/";
const FPL_LEAGUE_URL = "https://fantasy.premierleague.com/api/leagues-classic/{}/standings/";
const FPL_FIXTURE_URL = "https://fantasy.premierleague.com/api/fixtures/";


class FplClient {

    async getBootstrap() {
        const data = await this.request(FPL_SUMMARY_API_URL);
        return data;
    }

    async getFixtures() {
        const data = await this.request(FPL_FIXTURE_URL);
        return data;
    }

    request(url, params) {
        return new Promise ((resolve, reject) => {
            https.get(url, res => {
                res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                  body += data;
                });
                res.on("end", () => {
                  body = JSON.parse(body);
                  resolve(body);
                });
                res.on('error', err => {
                    reject(err);
                });
              });
        });
    }
}

module.exports.FplClient =  new FplClient();