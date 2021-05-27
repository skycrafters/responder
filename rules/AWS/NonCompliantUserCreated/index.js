Promise = require("bluebird");
const path = require("path");

const AWS = require("aws-sdk");
const IAM = new AWS.IAM();

const Rule = require(`${process.cwd()}/models/rule.js`);

let rule = new Rule({
	name: path.basename(path.dirname(__filename)),
	provider: "AWS"
});

rule.capture = (event, context) => {
	let findings = [];
	if (
		event.detail.requestParameters &&
		!event.detail.requestParameters.userName.match(context.config.userNamePattern)
	) {
		findings.push({
			message: `A user with username: ${event.detail.requestParameters.userName} has been created against the naming convention`,
			resources: [event.detail.requestParameters.userName],
		});
	}
	return findings;
}

rule.check = async (action, flow) => {
	console.log("Checking non Non-compliant user");
	const finding = flow.findings.find(finding =>
		finding.rule.name === flow.rule.rule
	)

	const userName = finding.resources[0];

	try {
		const profile = await IAM.getUser({
			UserName: userName
		}).promise();
		return true;
	} catch(error) {
		console.log(error.message);
		console.log(`The user ${userName} no longer exists`);
		// throw new Error(`The user ${finding.userName} no longer exists`);
		return false;
	}
};

rule.remediate = async (action, flow) => {
	console.log("Remediating non Non-compliant user");
	const finding = flow.findings.find(finding =>
		finding.rule.name === flow.rule.rule
	)

	const userName = finding.resources[0];

	let userNameParam = {
		UserName: userName
	};

	try {
		const data = await IAM.listAccessKeys(userNameParam).promise();
		if (data && data.AccessKeyMetadata) {
			await Promise.mapSeries(data.AccessKeyMetadata, (key) => {
				let params = {
					AccessKeyId: key.AccessKeyId,
					UserName: userName
				};
				return IAM.deleteAccessKey(params).promise();
			});
		}
	} catch(error) {
		console.log(error.message);
		console.log(`The access keys of user ${userName} no longer exists`);
	}

	try {
		const profile = await IAM.getLoginProfile(userNameParam).promise();
		if (profile && profile.LoginProfile) {
			let profileDeleted = false;
			let retryableError = true;
			// Necessary because the profile may not be in a deletable state when this code is triggered.
			while (!profileDeleted && retryableError) {
				try {
					await IAM.deleteLoginProfile(userNameParam).promise();
					profileDeleted = true;
				} catch (error) {
					console.log(error.message);
					if (error.code !== "EntityTemporarilyUnmodifiable") {
						retryableError = false;
						await new Promise((resolve) =>
							setTimeout(resolve, 2000)
						);
					}
				}
			}
		}

	} catch(error) {
		console.log(error.message);
		console.log(`The user login profile for ${userName} no longer exists`);
	}

	try {
		const params = {
			UserName: userName
		};
		await IAM.deleteUser(params).promise();
		return true;
	} catch(error) {
		console.log(error.message);
		console.log(`The user ${userName} no longer exists`);
		return false;
	}

}

module.exports = rule;