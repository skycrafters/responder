# Send Slack action

This action aims to create an easy way to [format](https://api.slack.com/messaging/composing/layouts) and send Slack messages.

## Configuration
`webhookURL` is the URL that is generated when creating a new integration Slack, read [Slack documentation for Incoming webhooks](https://api.slack.com/messaging/webhooks)

## Usage
The Slack integration can be used in different ways

### Simple message
A sinple text message can be specified by configuring a value for the `message` property
```
- rule: TheRuleName
  sequential:
    ...
    - command: SendSlack
      message: "Will terminate instances"
    ...
```

### Simple header
```
- rule: TheRuleName
  sequential:
    ...
    - command: SendSlack
      message:
        header: "This is a header"
    ...
```

### Header and values
Values are a JSONPath of the [context object]()
```
- rule: TheRuleName
  sequential:
    ...
    - command: SendSlack
	  message:
	   header: "Root has logged in"
       values:
	   - label: "Account"
	     value: "$.event.rawEvent.account"
       - label: "From"
	     value: "$.event.rawEvent.detail.sourceIPAddress"
	 ...
```

### Templates
You can specify a template for more advance formatting options
```
- rule: TheRuleName
  sequential:
    ...
    - command: SendSlack
	  template: aws-event
	 ...
```

## Templating
Templates are sitting in the `templates/` directory. The name of the template is the file itself.
