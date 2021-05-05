const ipRangeCheck = require("ip-range-check");

const ruleUtils = require(`${__dirname}/../../lib/rule-utils.js`);
const config = ruleUtils.getConfig(__dirname);

module.exports = {
	capture: (event) => {
		let findings = [];
		if (config.trustedIPs && !ipRangeCheck(event.detail.sourceIPAddress, config.trustedIPs)) {
			findings.push({
				message: "User logged into the AWS console from an untrusted IP address",
			});
		}
		return findings;
	}
};
