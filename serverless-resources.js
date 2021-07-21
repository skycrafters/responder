const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const Configuration = require(`${process.cwd()}/models/configuration.js`);

module.exports = () => {
	const actions = yaml.load(
		fs.readFileSync(path.resolve("actions.yml"), "utf8")
	);

	const flows = actions.flows.filter((flow) => flow.enabled !== false);

	const actionList = flows.reduce((acc, flow) => {
		const actions = (flow.sequential || flow.parallel)
			.filter((action) => action.command)
			.map((action) => action.command);

		if (actions.length) {
			acc = acc.concat(actions);
		}

		return acc;
	}, []);

	const actionResources = Array.from(new Set(actionList)).reduce(
		(acc, action) => {
			const actionConfig = new Configuration(["actions", action]).values;
			if (actionConfig.Resources) {
				acc = Object.assign(acc, actionConfig.Resources);
			}
			return acc;
		},
		{}
	);

	console.log("Resources");
	console.log(JSON.stringify(actionResources, null, 2));
	return {
		Resources: actionResources
	};
};
