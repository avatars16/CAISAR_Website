const buildDevLogger = require("./dev-logger");
const buildProductionLogger = require("./production-logger");

let logger = null;
if (process.env.NODE_ENV == "development") {
    logger = buildDevLogger();
} else {
    logger = buildProductionLogger();
}
logger.info("environment is: " + process.env.NODE_ENV);

module.exports = logger;
