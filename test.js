const { exec } = require("child_process");
(() => {
    const test = new Promise((resolve, reject) => {
        exec("aws s3 ls", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
    return test
        .then(() => console.log("looks good"))
        .catch((e) => console.error("Error", e));
})();