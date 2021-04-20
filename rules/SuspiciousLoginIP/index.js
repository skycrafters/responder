const yaml = require("js-yaml");
const path = require("path");
const fs   = require("fs");
const moment   = require("moment-timezone");
const ipRangeCheck = require("ip-range-check");
const config = yaml.load(fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8"));

module.exports = {
	name: "Login from an untrusted IP address",
	capture: (event) => {
		if (event.source !== "aws.signin") {
			return [];
		}

		if (event.detail.eventName !== "ConsoleLogin") {
			return [];
		}

		let findings = [];
		if (config.trustedIPs && !ipRangeCheck(event.detail.sourceIPAddress, config.trustedIPs)) {
			findings.push({
				message: "Suspicious activity detected, user logged into the AWS console from an untrusted IP address",
				severity: "HIGH"
			});
		}
		return findings;
	}
};
