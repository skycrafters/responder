const Promise = require("bluebird");
const { JSONPath } = require("jsonpath-plus");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const Configuration = require(`${process.cwd()}/models/configuration.js`);
const config = new Configuration([__dirname]).values;
const fetch = require("node-fetch");
// const console = require("console");

module.exports = async (action, flow) => {
	// user webhookURL
	let webhookURL = config.webhookURL;
	if (action.webhookURL) {
		webhookURL = action.webhookURL;
	}

	return Promise.mapSeries(flow.findings, async (finding) => {
		const message = buildMessage(finding, action, flow);
		try {
			await fetch (webhookURL, {
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
			console.log("Sending Google Chat message failed");
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
		// * message parsing debug
		// console.log("parsed-result", result);
		return result;
	}

	let message = {
		cards: [
			{
				header: {
					title: `<b>${action.message.header || action.message}</b>`,
					imageUrl: "https://i.ibb.co/LSd4Fhf/TEXT-RED.png"
				},
			}
		]
	};
	const altMessage = 	{
		cards: [
			{
				header: {
					title: `<b>${action.message.header || action.message}</b>`,
					imageUrl: "https://i.ibb.co/LSd4Fhf/TEXT-RED.png"
				},
				sections: [
					{
						widgets: []
					}
				]
			}
		]
	};

	if (typeof action.message === "string" || action.message.header) {
		message.cards[0].header.title = `<b>${action.message.header || action.message}</b>`;
	} else {
		message = altMessage
		message.cards[0].header.title = `<b>${finding.ruleTitle}</b>`;
		message.cards[0].sections[0].widgets.push({
			textParagraph: {
				text: `${finding.message}`
			}
		});
	}
	if (action.message.values) {
		message = altMessage
		message.cards[0].sections[0].widgets.push({
			textParagraph: {
				text: action.message.values
					.map((value) => {
						const result = JSONPath({
							path: value.value,
							json: flow
						});
						return `<b>${value.label}</b>: ${result}`;
					})
					.join("\n")
			}
		});
	}
	return message;
};
