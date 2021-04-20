const path = require("path");
module.exports = {
	name: "Root has logged in",
	capture: (event) => {
		if (event.source !== "aws.signin") {
			return [];
		}

		if (event.detail.eventName === "ConsoleLogin" && event.detail.userIdentity.type === "Root") {
			return [{
				message: "Suspicious activity detected, Root has logged into the console",
				severity: "EXTREME"
			}];
		}

		return [];
	}
};