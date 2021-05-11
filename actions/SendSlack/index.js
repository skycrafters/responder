Promise = require("bluebird");
const { JSONPath } = require("jsonpath-plus");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const { IncomingWebhook } = require("@slack/webhook");

const ruleUtils = require(`${process.cwd()}/lib/rule-utils.js`);
const config = ruleUtils.getConfig(__dirname);

module.exports = async (action, flow) => {
	if (!action.message) {
		console.error("Cannot send a Slack message without a message");
		return;
	}

	// using the Slack action default config
	let webhookURL = config.webhookURL;

	if (action.webhookURL) {
		// using the action-specific config
		webhookURL = action.webhookURL;
	}

	const webhook = new IncomingWebhook(webhookURL);

	return Promise.mapSeries(flow.findings, async (finding) => {
		let message = {};

		if (typeof action.message === "string" || action.message.header) {
			message = {
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `*${
								action.message.header || action.message
							}*`,
						},
					},
				],
			};
		} else {
			message = {
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `${config.icons[finding.severity]} *${
								finding.message
							}*`,
						},
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: action.message.values
								.map((value) => {
									const result = JSONPath({
										path: value.value,
										json: flow,
									});
									return `*${value.label}*: ${result}`;
								})
								.join("\n"),
						},
					},
				],
			};
		}
		try {
			await webhook.send(message);
			return true;
		} catch (error) {
			console.error(error);
			console.log("Sending Slack message failed");
			return false;
		}
	});
};
