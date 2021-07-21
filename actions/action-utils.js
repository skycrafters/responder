const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");

module.exports.getConfiguration = (actionName) => {
	const pathSections = [actionName];

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
			fs.readFileSync(
				path.resolve(...pathSections, "./config-default.yml"),
				"utf8"
			)
		);
	}

	if (!defaultConfig) {
		defaultConfig = {};
	}

	return Object.assign(defaultConfig, userConfig);
};
