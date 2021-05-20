module.exports = class Finding {
  constructor(finding, rule) {
  	if (finding.severity) {
    	this.severity = finding.severity;
  	} else {
  		this.severity = rule.config.severity;
  	}

	this.ruleTitle = rule.config.title;
	this.triggeredAt = Date.now();

    this.message = finding.message;
    this.resources = finding.resources || [];
    this.rule = rule;
  }

  get prettySeverity() {
    switch(this.severity) {
    	case "LOW":
    		return "Low";
    	case "MEDIUM":
    		return "Medium";
    	case "HIGH":
    		return "High";
    	case "VERY_HIGH":
    		return "Very High";
    	case "EXTREME":
    		return "Extreme"
    	default:
    		return "Undefined severity"
    }

  }

}
