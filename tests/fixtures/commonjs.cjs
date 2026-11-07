// A CommonJS file: require, module and __dirname are correct here, so nothing is reported.
const path = require("node:path");
const crypto = require("node:crypto");

module.exports = { here: path.join(__dirname, "x"), id: crypto.randomUUID() };
