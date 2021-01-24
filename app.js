const { exec } = require("child_process");
const knex = require('./config/database');

class Schedule {

    constructor() {
        this.getGameweeks().then(() => {
            this.createSchedule();
        });
    }

    getGameweeks() {
        return new Promise ((resolve, reject) => {
            knex('gameweek')
                .then(rows => {
                    this.dates = rows;
                    resolve();
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    createSchedule() {
        this.dates.forEach(({deadline_time, gameweek_id}) => {
            const dateString = this.buildDateString(new Date(deadline_time));
            const cmd = 'node ' + __dirname + `/command/reddit/PostGameweek.js --gw=${gameweek_id}`;
        
            exec(`${cmd} | at -t ${dateString}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        });
    }

    buildDateString(date){
        const year = date.getFullYear(),
            month = `${date.getMonth() + 1}`.padStart(2, "0"),
            day = `${date.getDate()}`.padStart(2, "0"),
            minutes = `${date.getMinutes()}`.padStart(2, "0"),
            seconds = `${date.getSeconds()}`.padStart(2, "0")
        ;
        return `${year}${month}${day}${date.getHours()}${minutes}.${seconds}`;
    }
}

const schedule = new Schedule();