'use strict';
const processEvent = require("./eventProcessor.js");
exports.handler = async (event, context) => {
  console.log(event);
  return await processEvent(event);
};
