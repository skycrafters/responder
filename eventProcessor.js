const fs = require("fs");
const Promise = require("bluebird");
const yaml = require("js-yaml");
const { JSONPath } = require("jsonpath-plus");

const commands = require("./lib/commands");
const Event = require("./models/event");
const Rule = require("./models/rule");

const flows = yaml
	.load(fs.readFileSync("./actions.yml", "utf8"))
	.flows.map((flow) => {
		return {
			rule: flow
		};
	})
	.filter((flow) => flow.rule.enabled !== false)
	.map((flow) => {
		flow.trigger = Rule.getTrigger("AWS", flow.rule.rule);
		return flow;
	});

const processEvent = (event) => {
	return Promise.filter(flows, (flow) => {
		return flow.trigger.every((trigger) => {
			const eventValue = JSONPath({
				path: trigger.path,
				json: event,
				wrap: false
			});
			return eventValue === trigger.value;
		});
	})
		.map((flow) => {
			flow.findings = commands.captureEvent(event, flow.rule);
			flow.event = new Event(event);
			return flow;
		})
		.then((flows) => {
			return flows.filter((flow) => !!flow.findings.length);
		})
		.map(async (flow) => {
			return commands.runSequence(flow);
		});
};

module.exports = processEvent;
