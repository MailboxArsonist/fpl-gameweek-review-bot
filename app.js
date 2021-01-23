const { exec } = require("child_process");

class Schedule {

    constructor() {
        this.getGameweeks().then(() => {
            this.createSchedule();
        });
    }

    getGameweeks() {
        return new Promise ((resolve, reject) => {
            setTimeout(() => {
                this.dates = ['2021-02-13 13:00:02', '2021-02-14 13:30:00']
                resolve();
            }, 1000);
        });
    }

    createSchedule() {
        this.dates.forEach(date => {
            const dateString = this.buildDateString(new Date(date));
            const cmd = 'node ' + __dirname + '/command/reddit/PostGameweek.js --gw=69';
        
            exec(`${cmd} | at -t ${dateString}`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
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
