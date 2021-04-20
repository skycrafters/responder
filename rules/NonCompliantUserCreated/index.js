Promise = require("bluebird");

const AWS = require("aws-sdk");
const IAM = new AWS.IAM();
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const config = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8")
);

module.exports = {
	name: "Non-compliant user created",
	capture: (event) => {
		if (event.source !== "aws.iam") {
			return [];
		}

		let result = [];

		if (event.detail.eventName === "CreateUser") {
			if (
				event.detail.requestParameters &&
				!event.detail.requestParameters.userName.match(config.userNamePattern)
			) {
				result.push({
					message:
						"Suspicious activity detected, a user has been created against the naming convention",
					severity: "EXTREME",
					id: "BAD_USER_CREATED",
					userName: event.detail.requestParameters.userName,
				});
			}
		}

		return result;
	},
	check: async (action, flow) => {
		console.log("Checking non Non-compliant user");
		const finding = flow.findings.find(finding =>
			finding.ruleName === flow.rule.rule
		)
		try {
			const profile = await IAM.getUser({
				UserName: finding.userName,
			}).promise();
			return true;
		} catch(e) {
			console.log(error.message);
			console.log(`The user ${finding.userName} no longer exists`);
			// throw new Error(`The user ${finding.userName} no longer exists`);
			return false;
		}
	},
	remediate: async (action, flow) => {
		console.log("Remediating non Non-compliant user");
		const finding = flow.findings.find(finding =>
			finding.ruleName === flow.rule.rule
		)
		let userNameParam = {
			UserName: finding.userName,
		};

		try {
			const data = await IAM.listAccessKeys(userNameParam).promise();
			if (data && data.AccessKeyMetadata) {
				await Promise.mapSeries(data.AccessKeyMetadata, (key) => {
					let params = {
						AccessKeyId: key.AccessKeyId,
						UserName: finding.userName,
					};
					return IAM.deleteAccessKey(params).promise();
				});
			}
		} catch(error) {
			console.log(error.message);
			console.log(`The access keys of user ${finding.userName} no longer exists`);
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
			console.log(`The user login profile for ${finding.userName} no longer exists`);
		}

		try {
			const params = {
				UserName: finding.userName,
			};
			await IAM.deleteUser(params).promise();
			return true;
		} catch(error) {
			console.log(error.message);
			console.log(`The user ${finding.userName} no longer exists`);
			return false;
		}

	}
};
