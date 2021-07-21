const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");

module.exports = class Configuration {
	constructor (pathSections) {
		this.pathSections = pathSections;
	}

	get defaultConfig () {
		let config = {};
		if (
			fs.existsSync(path.resolve(...this.pathSections, "./config-default.yml"))
		) {
			config = yaml.load(
				fs.readFileSync(
					path.resolve(...this.pathSections, "./config-default.yml"),
					"utf8"
				)
			);
		}

		if (!config) {
			return {};
		}

		return config;
	}

	get userConfig () {
		let config = {};
		if (fs.existsSync(path.resolve(...this.pathSections, "./config.yml"))) {
			config = yaml.load(
				fs.readFileSync(
					path.resolve(...this.pathSections, "./config.yml"),
					"utf8"
				)
			);
		}

		if (!config) {
			return {};
		}

		return config;
	}

	get values () {
		return Object.assign(this.defaultConfig, this.userConfig);
	}
};
