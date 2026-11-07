// A CommonJS file: require, module and __dirname are correct here, so nothing is reported.
const path = require("node:path");

module.exports = { here: path.join(__dirname, "x") };
