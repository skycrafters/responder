const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const Finding = require(`${process.cwd()}/models/finding.js`);

const getConfiguration = (provider, name) => {
	const pathSections = ["rules", provider, name];

	let userConfig = {};
	if (fs.existsSync(path.resolve(...pathSections, "./config.yml"))) {
		userConfig = yaml.load(
			fs.readFileSync(path.resolve(...pathSections, "./config.yml"), "utf8")
		);
	}

	if (!userConfig) {
		userConfig = {};
	}

	let defaultConfig = {};
	if (fs.existsSync(path.resolve(...pathSections, "./config-default.yml"))) {
		defaultConfig = yaml.load(
			fs.readFileSync(path.resolve(...pathSections, "./config-default.yml"), "utf8")
		);
	}

	if (!defaultConfig) {
		defaultConfig = {};
	}

	return Object.assign(defaultConfig, userConfig);
}


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

		this.ruleConfig = getConfiguration(this.provider, this.name);

		return this.ruleConfig;
	}

	static getTrigger(provider, ruleName) {
		const configuration = getConfiguration(provider, ruleName);

		return configuration.trigger;
	}

}
