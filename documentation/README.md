# Table of contents

[Overview](#overview)
[Creating a rule](#creating-rule)
   [Capturing events principles](#captureevents)
	   [Creating a rule trigger](#rule-trigger)
	   [Creating a rule logic](#rule-logic)


# Creating a rule

## <a name="captureevents"></a>Capture events principles

### Triggers 

Capuring events, or detecting events is the entryway to the software
The capture phase will compare the input event with all the enabled triggers that could start a flow.

A trigger is a set of key-value statments that will determine whether the event is of significance. 
- The key represents the [JSONPath](https://www.toolsqa.com/rest-assured/jsonpath-and-query-json-using-jsonpath/)  value of the location of the property to assert in the event payload
- The value is the value to be asserted<br />
If all the values on the trigger array match, then the capture phase can begin.

#### Example

Consider the following in config-default.yml of a rule:<br />

```yaml
trigger:
  - path: $.source
    value: aws.iam
  - path: $.detail.eventName
    value: CreateUser
  - path: $.detail.errorCode ## error code must be null
```
The capture sequence will be triggered if the event payload looks like the following
```
{
	"source": "aws.iam",
	"detail" {
		...
		"eventName": "CreateUser"
		...
	}
}
```
However, if the event payload looks like the following, due to a presence of an error in the errorCode property, the sequence will not be triggered because it is expecting a null value for `$.detail.errorCode`
```
{
	"source": "aws.iam",
	"detail" {
		...
		"eventName": "CreateUser",
		"errorCode": "UserAlreadyExists"
		...
	}
}
```

### Capture

The capture stage is the phase that will check if the event that has been captured via the trigger creates a finding. It is a more granular logic than the trigger phase.

A finding is a result of a capture. A capture would result in an array of findings. If the capture phase does not detect any finding, it returns an empty array and the sequence stops here.

The capture phase can result in more than one finding.

When the capture phase results in one or more findings, the action phase can start, it will sequentially (or in parallel) execute the configured actions as long as the previous action returns `true`


