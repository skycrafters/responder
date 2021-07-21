const Promise = require("bluebird");
const { exec } = require("child_process");
const AWS = require("aws-sdk");
AWS.config.setPromisesDependency(Promise);
const EC2 = new AWS.EC2();
const SecretsManager = new AWS.SecretsManager();
const SSMSecretName = "CloudResponderSecret";

const removeSecret = async (regions) => {
	await SecretsManager.removeRegionsFromReplication({
		SecretId: SSMSecretName,
		RemoveReplicaRegions: regions
	}).promise();
	await SecretsManager.deleteSecret({
		ForceDeleteWithoutRecovery: true,
		SecretId: SSMSecretName
	}).promise();
};

const getRegions = () => {
	return EC2.describeRegions({})
		.promise()
		.then((data) => data.Regions)
		.map((region) => {
			return region.RegionName;
		})
		.filter((region) => region !== "ap-northeast-3");
};

const removeServerless = (region) => {
	return new Promise((resolve, reject) => {
		console.log("sls remove --region " + region);
		exec("sls remove --region " + region, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				reject(error);
				return;
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				reject(stderr);
				return;
			}
			console.log(stdout);
			resolve(stdout);
		});
	});
};

const removeEventBridgeRule = async (region) => {
	console.log("Will try to delete stack in ", region);

	const stackName = "cloud-responder-eventbridge";
	const CloudFormation = new AWS.CloudFormation({ region: region });
	const pendingStates = [
		"CREATE_IN_PROGRESS",
		"UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
		"UPDATE_IN_PROGRESS",
		"DELETE_IN_PROGRESS"
	];
	// const errorStates = [
	// 	"CREATE_FAILED",
	// 	"ROLLBACK_FAILED",
	// 	"UPDATE_ROLLBACK_FAILED"
	// ];

	const checkCompletion = () => {
		return CloudFormation.describeStacks({
			StackName: stackName
		})
			.promise()
			.then((data) => data.Stacks[0].StackStatus)
			.then((status) => {
				if (pendingStates.includes(status)) {
					return Promise.delay(2000).then(checkCompletion);
				}
				console.log("[%s] done", region);
				return Promise.resolve();
			})
			.catch((error) => {
				console.log("[%s] done, with %s", region, error.message);
				return Promise.resolve();
			});
	};

	const stackExists = await CloudFormation.describeStacks({
		StackName: stackName
	})
		.promise()
		.then((data) => {
			return data.Stacks.length > 0;
		})
		.catch(() => {
			return false;
		});

	if (!stackExists) {
		return;
	}

	console.log("Deleting stack from ", region);
	return CloudFormation.deleteStack({
		StackName: stackName
	})
		.promise()
		.then(checkCompletion);
};

(async () => {
	const regions = await getRegions();
	await removeServerless("us-east-1");
	await Promise.map(regions, async (region) => {
		return removeEventBridgeRule(region);
	});
	await removeSecret(regions.filter((region) => region !== "us-east-1"));
})();

// getRegions().map(async region => {

//  // const EventBridge = new AWS.EventBridge({ region: region });

//  // await EventBridge.deleteConnection({
//  //  Name: "CloudResponderAPIConnection"
//  // }).promise();;

//  const SecretsManager = new AWS.SecretsManager({ region: region });
//  const secrets = await SecretsManager.listSecrets().promise();
//  console.log(region)
//  console.log(secrets)
//  console.log(secrets.SecretList.length)
//  if (!secrets.SecretList.length) {
//    return;
//  }

//  console.log({
//    ForceDeleteWithoutRecovery: true,
//    SecretId: secrets.SecretList[0].Name,
//  })
//  const result = await SecretsManager.deleteSecret({
//    ForceDeleteWithoutRecovery: true,
//    SecretId: secrets.SecretList[0].Name,
//  }).promise().catch(error => console.log(error));

//  console.log("--", result);
// })
