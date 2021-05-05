'use strict';
const Promise = require("bluebird");
const processEvent = require("./eventProcessor.js");
const AWS = require("aws-sdk");
const SNS = new AWS.SNS({});
const SecretsManager = new AWS.SecretsManager();
const SSMSecretName = "CloudResponderSecret";

exports.authorizer = async (event, context) => {
	const key = await SecretsManager.getSecretValue({SecretId: SSMSecretName}).promise().then((data) => data.SecretString);
	let effect = "Deny"
	if (event.authorizationToken === key) {
		effect = "Allow";
	}
	return {
		principalId: "user",
		policyDocument: {
			Version: "2012-10-17",
			Statement: [
				{
					Action: "execute-api:Invoke",
					Effect: effect,
					Resource: event.methodArn
				}
			]
		}
	};
};

exports.capture = async (event, context) => {
	const AWSAccountId = context.invokedFunctionArn.split(':')[4];
	const ARN = `arn:aws:sns:${process.env.AWS_REGION}:${AWSAccountId}:dispatch`;
	await SNS.publish({
		Message: JSON.stringify({
			default: event.body
		}),
		MessageStructure: "json",
		TopicArn: ARN
	}).promise();
	return {
		statusCode: 200,
		body: JSON.stringify({ message: "" })
	};
};

exports.process = async (event, context) => {
	const message = JSON.parse(event.Records[0].Sns.Message);
	console.log(message)
	await processEvent(message);
};

