const { exec } = require("child_process");

const dates = ['2021-02-13 13:00:02', '2021-02-14 13:30:00'];

dates.forEach(date => {
    const date = new Date(date);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    const seconds = `${date.getSeconds()}`.padStart(2, "0");
    const dateString = `${year}${month}${day}${date.getHours()}${minutes}.${seconds}`;

    exec(`echo "test_test_test" | at -t ${dateString}`, (error, stdout, stderr) => {
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