// A CommonJS file: require, module and __dirname are correct here, so nothing is reported.
const path = require("node:path");
const crypto = require("node:crypto");

/**
 * Builds a unique path under this folder.
 * @param {string} name - File name to place under this folder.
 * @returns {string} The absolute path with a random suffix.
 */
function here(name) {
  return path.join(__dirname, `${name}-${crypto.randomUUID()}`);
}

module.exports = { here };
