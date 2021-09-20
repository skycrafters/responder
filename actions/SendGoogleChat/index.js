const Promise = require("bluebird");
const { JSONPath } = require("jsonpath-plus");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const Configuration = require(`${process.cwd()}/models/configuration.js`);
const config = new Configuration([__dirname]).values;
const fetch = require("node-fetch");
const console = require("console");

module.exports = async (action, flow) => {
    // user webhookURL
    let webhookURL = config.webhookURL;
    if (action.webhookURL) {
        webhookURL = action.webhookURL;
    };

    return Promise.mapSeries(flow.findings, async (finding) => {
        // build messages & invoke specified actions
        const message = buildMessage(finding, action, flow);
        try {
            await fetch(webhookURL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(message)
            }).then((response) => {
                // * debug log
                // console.log(response)
            });

            return true;
        } catch (error) {
            console.error(error);
            console.log("Sending Google Chat message failed");
            return false;
        }
    });
};

const buildMessage = (finding, action, flow) => {
    // checking for template...
    if (action.template && fs.existsSync(`${__dirname}/templates/${action.template}.yml`)) {
        const template = Handlebars.compile(fs.readFileSync(`${__dirname}/templates/${action.template}.yml`, "utf8"));
        // loading template
        const result = yaml.load(
            template(
                {
                    finding,
                    action,
                    flow
                },
                {
                    // security
                    // not recommended, but can't find a better way for now
                    allowProtoPropertiesByDefault: true
                }
            )
        );
        // * message parsing debug
        // console.log("parsed-result", result);
        return result;
    }

    // google chat card msg. format/schema
    // ref: https://developers.google.com/chat/reference/message-formats
    const message = {
        cards: [
            {
                sections: [
                    {
                        widgets: [
                            {
                                textParagraph: {
                                    text: ""
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // schema traversal + message build

    // array markers for pushing sequentially.
    const cardsLength = message.cards.length - 1;
    const widgetsLength = message.cards[cardsLength].sections.length - 1;

    if (typeof action.message === "string" || action.message.header) {
        message.cards[cardsLength].sections[widgetsLength].widgets.push({
            textParagraph: { text: `<b>${action.message.header || action.message}</b>` }
        });
    } else {
        message.cards[cardsLength].sections[widgetsLength].widgets.push({
            textParagraph: { text: `<b>${finding.ruleTitle}</b>` }
        });
        message.cards[cardsLength].sections[widgetsLength].widgets.pushh({
            textParagraph: { text: `<b>${finding.message}</b>` }
        });
    };

    const sections = [];
    if (action.message.values) {
        action.message.values.map((value) => {
            const result = JSONPath({
                path: value.value,
                json: flow
            });
            return sections.push({
                widgets: [
                    {
                        textParagraph: { text: `<b>${value.label}</b>` }
                    },
                    {
                        textParagraph: { text: `${result}` }
                    }]
            });
        });
        message.cards[cardsLength].sections = sections;
    }
    // * message build debug
    // console.log(message)
    return message;
};