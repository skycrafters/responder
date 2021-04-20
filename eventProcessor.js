const Promise = require("bluebird");
const yaml = require("js-yaml");
const fs = require("fs");
const commands = require("./lib/commands");

const flows = yaml
	.load(fs.readFileSync("./actions.yml", "utf8"))
	.flows.map((flow) => {
		return {
			// machine: machine.create(flow),
			rule: flow,
		};
	})
	.filter((flow) => flow.enabled !== false);

const processEvent = (event) => {
	return Promise.map(flows, (flow) => {
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
