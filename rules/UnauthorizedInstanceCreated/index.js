Promise = require("bluebird");

const AWS = require("aws-sdk");
const EC2 = new AWS.EC2({
	region: "us-east-1",
});
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const config = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8")
);

module.exports = {
	name: "Non-compliant user created",
	capture: (event) => {
		if (event.detail && event.source !== "aws.ec2") {
			return [];
		}

		let findings = [];

		if (event.detail.eventName === "RunInstances") {
			console.log(JSON.stringify(event.detail, null, 2));

			if (!isValid(event.detail.requestParameters.instanceType, config)) {
				findings.push({
					message: "Unauthorized instance has been launched",
					severity: "HIGH",
					id: "UNAUTHORIZED_INSTANCE_CREATED",
					instanceType: event.detail.requestParameters.instanceType,
					instanceIds: event.detail.responseElements.instancesSet.items.map(
						(instance) => instance.instanceId
					)
				});
			}
		}

		return findings;
	},
	check: async (action, flow) => {
		console.log("Checking running instances");
		console.log(flow);
		const finding = flow.findings.find(
			(finding) => finding.ruleName === flow.rule.rule
		);
		try {
			const instances = await EC2.describeInstanceStatus({
				InstanceIds: finding.instanceIds,
			}).promise();
			console.log(JSON.stringify(instances, null, 2));
			const i = await EC2.describeInstances({
				InstanceIds: finding.instanceIds,
			}).promise();
			console.log(JSON.stringify(i, null, 2));
			const areInstancesRunning = instances.InstanceStatuses.some(
				(instance) => instance.InstanceState.Code === 16 || instance.InstanceState.Code === 0
			);
			if (areInstancesRunning) {
				return true;
			}
			console.log(`Specified instances are not running`);
			return false;
		} catch (error) {
			console.log(error);
			console.log(error.message);
			console.log(`The instance ${finding.instanceIds} no longer exists`);
			return false;
		}
	},
	remediate: async (action, flow) => {
		console.log("Checking running instances");
		console.log(flow);
		const finding = flow.findings.find(
			(finding) => finding.ruleName === flow.rule.rule
		);
		try {
			const instances = await EC2.terminateInstances({
				InstanceIds: finding.instanceIds,
			}).promise();
			return true;
		} catch(error) {
			console.log(error);
			console.log(error.message);
			console.log(`The instance ${finding.instanceIds} no longer exists`);
			return false;
		}
	},
};

const isValid = (instanceType, configuration) => {
	const isInvalidInstance = configuration.blackListedInstances.find(
		(rule) => {
			return instanceType.match(rule);
		}
	);
	if (isInvalidInstance) {
		return false;
	}
	const isValidInstance = configuration.whiteListedInstances.find((rule) => {
		return instanceType.match(rule);
	});
	if (isValidInstance) {
		return true;
	}
	return false;
};
