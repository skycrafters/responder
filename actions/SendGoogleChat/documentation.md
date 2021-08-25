#  Google Chat actions


This action aims to create an easy way to [format](https://developers.google.com/chat/reference/message-formats) and send alerts as Google Chat messages.

## Quick Links
[Initial setup](#initial-setup)

[Usage](#usage)

[Examples](#usage-examples)

[Templating](#templating)

<p>&nbsp;</p>

## Initial setup

  

1. Google Chat's webhook functionality is currently only accessible with an [admin account](https://workspace.google.com/products/admin/). 

2. To enable webhooks in your Google Chat room, click on the room's title when it's opened and active on your page. Select **configure webhooks** within the dropdown menu. More information on Google Chat webhook configuration can be found [here](https://developers.google.com/chat/how-tos/webhooks). 

3. Inside the actions folder are specified folders for each service. SendGoogleChat will have a ```config-default.yml``` that holds the value representing your webhook url. Replace this value with your Google Chat Webhook URL you configured in the previous step.  

3. (optional) [Configure](#usage) and [locally test](../../README.md#testing-your-configuration) your Google Chat integration. Once you are satisfied with your configuration, you must [re-deploy](../../README.md#deploy) **Responder** to finalize your changes.

4. Congratulations you should now be able receive custom **Responder** alerts in your Google Chat room!
	
  <p>&nbsp;</p>


## Usage

The Google Chat integration can be used in a two different ways. 

1. Simple text alerts can be customized to higher complexity using Google's [message formatting guidelines](https://developers.google.com/chat/reference/message-formats). These alteration will be synonymous to your `actions.yml` file located in main directory of this repository. Any changes made within this file will subsequently change the structure of your webhook alert. 

2. Additionally you can utilize templates. By default **Responder** comes with a prebuilt template for AWS. However, in the future we hope to add templates for other platforms. 

<p>&nbsp;</p>

## Usage Examples
<p>&nbsp;</p>

### Simple message example:

A simple text message can be specified by configuring a value for the `message` property in the `actions.yml` file.

```yml

- rule: TheRuleName

  sequential:

...

- command: SendGoogleChat

  message: "Write your custom message here"

...

```

  

### Simple header example:

A simple header message can be created by adding a value to the `header` property in the `actions.yml` file.

```yml

- rule: TheRuleName

  sequential:

...

- command: SendGoogleChat

  message:

  header: "Write your custom header here"

...

```

  

### Header and values example:

A Header and Values message can be created by adding a value to the `header` property, as well as adding / configuring the `values` property in the `actions.yml` file. 

Values are a JSONPath of the [context object]()

```yml

- rule: TheRuleName

sequential:

...

- command: SendGoogleChat

  message:

  header: "e.g. Root has logged in"

  values:

- label: "e.g. Account"

  value: "$.event.rawEvent.account"

- label: "e.g. From"

  value: "$.event.rawEvent.detail.sourceIPAddress"

...

```

  
<p>&nbsp;</p>

### Templates example:

It's easy to specify a template as well. This will provide more advanced formatting options. This is also done in the `actions.yml` file. 

As mentioned above, **Responder** comes with a prebuilt template for AWS. 
The `aws-event` template is preconfigured to be used "right out of the box" with no further setup. But remember the template is just a starting point so feel free to customize it to suit your needs!

For more information on customizing event templates, refer to our  [templating section](#templating) 

```yml

- rule: TheRuleName

  sequential:

...

- command: SendGoogleChat

  template: aws-event

...

```

<p>&nbsp;</p>

## Templating

Existing templates are located in the `actions/SendGoogleChat/templates` directory. The name of the template is the file itself. The existing templates were built referencing this: [Google Chat webhooks formatting](https://developers.google.com/chat/reference/message-formats) 
