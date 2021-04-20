const Promise = require("bluebird")
const { exec } = require("child_process");
const AWS = require("aws-sdk");
	AWS.config.setPromisesDependency(Promise);
	AWS.config.update({region:'us-east-1'});
const EC2 = new AWS.EC2();

const regions = EC2.describeRegions({}).promise().then((data) => data.Regions).mapSeries((region) => {
	console.log(region);
	return new Promise((resolve, reject) => {
		console.log("sls deploy --region " + region.RegionName);
		exec("sls deploy --region " + region.RegionName, (error, stdout, stderr) => {
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
			console.log(`stdout: ${stdout}`);
			resolve(stdout)
		});
	});
});
