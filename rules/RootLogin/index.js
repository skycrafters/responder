const path = require("path");
module.exports = {
	capture: (event) => {
		return [{
			message: "Suspicious activity detected, Root has logged into the console",
		}];
	}
};
