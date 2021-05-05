const Promise = require("bluebird");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const SNS = new AWS.SNS({});
const { JSONPath } = require("jsonpath-plus");

const config = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8")
);

module.exports = async (action, flow) => {

	return Promise.mapSeries(flow.findings, (finding) => {

		let emailBody = `${flow.config.name} \nSeverity: ${flow.config.severity}`;
			emailBody += "\n----------\n";
			emailBody += JSON.stringify(finding, null, 2);
			emailBody += "\n----------\n";
			emailBody += JSON.stringify(flow.event, null, 2);

		return SNS.publish({
			TopicArn: process.env.EMAIL_TOPIC_ARN,
			Subject: action.subject || finding.message,
			Message: emailBody
		})
		.promise()
		.then(() => {
			console.log("Email successfully sent");
			return true;
		})
		.catch((error) => {
			console.log(error);
			return false;
		});

	})

};
