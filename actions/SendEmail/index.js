const Promise = require("bluebird");

const AWS = require("aws-sdk");
const SNS = new AWS.SNS({});

const actionUtils = require(`${process.cwd()}/actions/action-utils.js`);
const config = actionUtils.getConfiguration(__dirname);

module.exports = async (action, flow) => {

	return Promise.mapSeries(flow.findings, (finding) => {

		let emailBody = `${finding.message} \nSeverity: ${finding.severity}`;
			emailBody += "\n----------\n";
			emailBody += JSON.stringify(finding, null, 2);
			emailBody += "\n----------\n";
			emailBody += JSON.stringify(flow.event, null, 2);

		return SNS.publish({
			TopicArn: process.env.EMAIL_TOPIC_ARN,
			Subject: action.subject || finding.ruleTitle,
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
