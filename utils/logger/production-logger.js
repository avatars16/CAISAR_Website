const { createLogger, format, transports } = require("winston");
const { combine, timestamp, errors } = format;

function buildProductionLogger() {
    return createLogger({
        level: "debug",
        format: combine(timestamp(), errors({ stack: true }), format.json()),
        defaultMeta: { service: "user-service" },
        transports: [
            new transports.Console(),
            new transports.File({ filename: "/logs/all-logs.log" }),
        ],
    });
}
module.exports = buildProductionLogger;
