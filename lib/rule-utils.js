const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");

module.exports.getConfig = (location) => {

	let userConfig = {};
	if (fs.existsSync(path.resolve(location, "./config.yml"))) {
		userConfig = yaml.load(
			fs.readFileSync(path.resolve(location, "./config.yml"), "utf8")
		);
	}

	let defaultConfig = {};
	if (fs.existsSync(path.resolve(location, "./config-default.yml"))) {
		defaultConfig = yaml.load(
			fs.readFileSync(path.resolve(location, "./config-default.yml"), "utf8")
		);
	}

	return Object.assign(defaultConfig, userConfig);
}
