const fs = require("fs");
const Promise = require("bluebird");
const yaml = require("js-yaml");
const { JSONPath } = require("jsonpath-plus");

const commands = require("./lib/commands");
const ruleUtils = require("./lib/rule-utils");

const flows = yaml
	.load(fs.readFileSync("./actions.yml", "utf8"))
	.flows.map((flow) => {
		return {
			rule: flow,
		};
	})
	.filter((flow) => flow.rule.enabled !== false)
	.map((flow) => {
		flow.config = ruleUtils.getConfig(`${__dirname}/rules/${flow.rule.rule}`);
		flow.config.trigger = flow.config.trigger || [];
		return flow;
	});

const processEvent = (event) => {
	return Promise.filter(flows, (flow) => {
		return flow.config.trigger.every((trigger) => {
			const eventValue = JSONPath({
				path: trigger.path,
				json: event,
				wrap: false
			});
			return eventValue === trigger.value
		})
	}).map((flow) => {
		flow.findings = commands.captureEvent(event, flow.rule);
		flow.event = event;
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
