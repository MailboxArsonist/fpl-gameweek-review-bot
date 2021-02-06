const https = require("https");
const { FPL_SUMMARY_API_URL, FPL_FIXTURE_URL } = require('./constants/fplApiUrls');


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