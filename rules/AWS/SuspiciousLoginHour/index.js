const path = require("path");
const moment = require("moment-timezone");
const ipRangeCheck = require("ip-range-check");

const Rule = require(`${process.cwd()}/models/rule.js`);

let rule = new Rule({
	name: path.basename(path.dirname(__filename)),
	***REMOVED*** "AWS"
})

rule.capture = (event, context) => {
	let findings = [];

	const operatingHours = context.config.operatingHours;

	if (operatingHours && operatingHours.timeZone) {
		if (
			isWeekend(operatingHours.timeZone) &&
			operatingHours.weekend
		) {
			const now = moment.tz(operatingHours.timeZone);
			const from = moment(operatingHours.weekend.from, [
				"h:mmA",
			]).format("HH:mm");
			const to = moment(operatingHours.weekend.to, [
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
					severity: context.config.severity || "HIGH"
				});
			}
		}
		if (
			!isWeekend(operatingHours.timeZone) &&
			operatingHours.week
		) {
			const now = moment.tz(operatingHours.timeZone);
			const from = moment(operatingHours.week.from, [
				"h:mmA",
			]).format("HH:mm");
			const to = moment(operatingHours.week.to, [
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
						"Suspicious activity detected, user logged outside of standard working hours"
				});
			}
		}
	}

	return findings;

};

module.exports = rule;

const isWeekend = (timeZone) => {
	const now = moment.tz(timeZone);
	return now.day() === 6 || now.day() === 0;
};
