const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const Configuration = require(`${process.cwd()}/models/configuration.js`);

module.exports = () => {

	const actions = yaml.load(
		fs.readFileSync(path.resolve("actions.yml"), "utf8")
	);

	const flows = actions.flows.filter((flow) => flow.enabled !== false);

	const rulePolicyStatements =
		flows.reduce((acc, flow) => {
			const ruleConfig = (new Configuration(["rules", flow.provider, flow.rule])).values;
			if (ruleConfig.IAMPolicyStatement) {
				acc = acc.concat(ruleConfig.IAMPolicyStatement);
			}
			return acc;
		}, []);


	const actionList =
		flows.reduce((acc, flow) => {
			const actions = (flow.sequential || flow.parallel)
				.filter((action) => action.command)
				.map((action) => action.command);

			if (actions.length) {
				acc = acc.concat(actions);
			}

			return acc;
		}, [])

	const actionPolicyStatements = Array.from(new Set(actionList)).reduce((acc, action) => {
		const actionConfig = (new Configuration(["actions", action])).values;
		if (actionConfig.IAMPolicyStatement) {
			acc = acc.concat(actionConfig.IAMPolicyStatement);
		}
		return acc;
	}, []);

	console.log("Policies")
	console.log(actionPolicyStatements.concat(rulePolicyStatements))

	return actionPolicyStatements.concat(rulePolicyStatements);

}

