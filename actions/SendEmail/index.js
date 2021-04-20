const Promise = require("bluebird");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");

const config = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8")
);

module.exports = async (action, flow) => {
	console.log("Sending Email with");
	console.log("Recipients:", action.recipients);
	console.log("Subject:", action.subject);
	console.log("Body:", action.body);

	return Promise.delay(1000);
};
