const moment = require("moment-timezone");
const ipRangeCheck = require("ip-range-check");

const ruleUtils = require(`${__dirname}/../../lib/rule-utils.js`);
const config = ruleUtils.getConfig(__dirname);

module.exports = {
	capture: (event) => {
		let findings = [];

		if (config.operatingHours && config.operatingHours.timeZone) {
			if (
				isWeekend(config.operatingHours.timeZone) &&
				config.operatingHours.weekend
			) {
				const now = moment.tz(config.operatingHours.timeZone);
				const from = moment(config.operatingHours.weekend.from, [
					"h:mmA",
				]).format("HH:mm");
				const to = moment(config.operatingHours.weekend.to, [
					"h:mmA",
				]).format("HH:mm");
				if (
					!now.isBetween(
						now
							.clone()
							.hour(from.split(":")[0])
							.minute(from.split(":")[1]),
						now
							.clone()
							.hour(to.split(":")[0])
							.minute(to.split(":")[1])
					)
				) {
					findings.push({
						message: "User logged outside of standard working hours",
					});
				}
			}
			if (
				!isWeekend(config.operatingHours.timeZone) &&
				config.operatingHours.week
			) {
				const now = moment.tz(config.operatingHours.timeZone);
				const from = moment(config.operatingHours.week.from, [
					"h:mmA",
				]).format("HH:mm");
				const to = moment(config.operatingHours.week.to, [
					"h:mmA",
				]).format("HH:mm");
				if (
					!now.isBetween(
						now
							.clone()
							.hour(from.split(":")[0])
							.minute(from.split(":")[1]),
						now
							.clone()
							.hour(to.split(":")[0])
							.minute(to.split(":")[1])
					)
				) {
					findings.push({
						message:
							"Suspicious activity detected, user logged outside of standard working hours",
						severity: "MEDIUM",
					});
				}
			}
		}

		return findings;
	}
};

const isWeekend = (timeZone) => {
	const now = moment.tz(timeZone);
	return now.day() === 6 || now.day() === 0;
};
