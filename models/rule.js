
const Finding = require(`${process.cwd()}/models/finding.js`);
const Configuration = require(`${process.cwd()}/models/configuration.js`);

module.exports = class Rule {
	constructor(rule) {
		this.name = rule.name;
		this.provider = rule.provider;
		this.functions = {};
	}

	set capture(capture) {
		this.functions.capture = capture;
	}

	get capture() {
		return (event) => {
			const findings = this.functions.capture.apply(this, [event, this]);
			if (!findings || !findings.length) {
				return [];
			}

			return findings.map((finding) => {
				return new Finding(finding, this);
			})
		};
	}

	get config () {
		if (this.ruleConfig) {
			return this.ruleConfig;
		}

		this.ruleConfig = (new Configuration(["rules", this.provider, this.name])).values;

		return this.ruleConfig;
	}

	static getTrigger(provider, ruleName) {
		const configuration = (new Configuration(["rules", provider, ruleName])).values;

		return configuration.trigger;
	}

}
