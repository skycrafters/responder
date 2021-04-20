const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const moment = require("moment-timezone");
const ipRangeCheck = require("ip-range-check");
const config = yaml.load(
	fs.readFileSync(path.resolve(__dirname, "./config.yml"), "utf8")
);

module.exports = {
	name: "Login outside of work hours",
	capture: (event) => {
		if (event.source !== "aws.signin") {
			return [];
		}

		if (event.detail.eventName !== "ConsoleLogin") {
			return [];
		}

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
						message:
							"Suspicious activity detected, user logged outside of standard working hours",
						severity: "MEDIUM",
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
