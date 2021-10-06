const Promise = require("bluebird");
const { JSONPath } = require("jsonpath-plus");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const Configuration = require(`${process.cwd()}/models/configuration.js`);
const config = new Configuration([__dirname]).values;
const fetch = require("node-fetch");

module.exports = async (action, flow) => {
	// using the Discord action default config
	let webhookURL = config.webhookURL;
	if (action.webhookURL) {
		// using the action-specific config
		webhookURL = action.webhookURL;
	}

	return Promise.mapSeries(flow.findings, async (finding) => {
		const message = buildMessage(finding, action, flow);
		try {
			await fetch(webhookURL, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},

				body: JSON.stringify(message)
			}).then((response) => {
				console.log("sussfully posted our fetch...");
			});

			return true;
		} catch (error) {
			console.error(error);
			console.log("Sending discord message failed");
			return false;
		}
	});
};

const buildMessage = (finding, action, flow) => {
	const eventTime = new Date(flow.event.rawEvent.detail.eventTime);
	const currentTime = new Date();
	const diffTime = Math.abs(eventTime - currentTime);
	const diffSecs = Math.ceil(diffTime / 1000);
	finding.delay = diffSecs;

	// checking for template...
	if (
		action.template &&
    fs.existsSync(`${__dirname}/templates/${action.template}.yml`)
	) {
		const template = Handlebars.compile(
			fs.readFileSync(`${__dirname}/templates/${action.template}.yml`, "utf8")
		);
		// loading template
		const result = yaml.load(
			template(
				{
					finding,
					action,
					flow
				},
				{
					// security
					// not recommended, but can't find a better way for now
					allowProtoPropertiesByDefault: true
				}
			)
		);
		return result;
	}

	const message = {
		username: "Responder",
		// avatar_url: 'https://i.imgur.com/fKL31aD.jpg%22%7D%7D%5D%7D',
		embeds: []
	};
	if (typeof action.message === "string" || action.message.header) {
		message.content = `**${action.message.header || action.message}**`;
	} else {
		message.content = `**${finding.ruleTitle}**`;
		message.embeds.push({
			title: finding.message,
			color: 15258703
		});
	}
	if (action.message.values) {
		message.embeds.push({
			title: action.message.values
				.map((value) => {
					const result = JSONPath({
						path: value.value,
						json: flow
					});
					return `**${value.label}**: ${result}`;
				})
				.join("\n")
		});
	}
	return message;
};
