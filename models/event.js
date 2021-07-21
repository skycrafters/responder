module.exports = class Event {
	constructor (event) {
		this.rawEvent = event;
	}

	get initiator () {
		if (this.isAWS()) {
			if (this.rawEvent.detail.userIdentity?.type === "IAMUser") {
				return this.rawEvent.detail.userIdentity?.userName;
			}
			if (this.rawEvent.detail.userIdentity?.type === "Root") {
				return "Root user";
			}
		}

		return "Unknown";
	}

	get initiatingIP () {
		if (this.isAWS()) {
			if (this.rawEvent.detail.sourceIPAddress) {
				return this.rawEvent.detail.sourceIPAddress;
			}
		}

		return "Unknown";
	}

	get region () {
		if (this.isAWS()) {
			if (this.rawEvent.detail.awsRegion) {
				return this.rawEvent.detail.awsRegion;
			}
		}

		return "Unknown";
	}

	get account () {
		if (this.isAWS()) {
			if (this.rawEvent.account) {
				return this.rawEvent.account;
			}
		}

		return "Unknown";
	}

	get source () {
		if (
			this.rawEvent["details-type"] === "AWS Console Sign In via CloudTrail"
		) {
			return "AWS";
		}

		if (this.rawEvent.source.startsWith("aws.")) {
			return "AWS";
		}
	}

	isAWS () {
		return this.source === "AWS";
	}
};
