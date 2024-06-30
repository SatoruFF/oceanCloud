import winston from 'winston';
let alignColorsAndTime = winston.format.combine(winston.format.colorize({
    all: true
}), winston.format.label({
    label: '[WINSTON]'
}), winston.format.timestamp({
    format: "YY-MM-DD HH:mm:ss"
}), winston.format.printf(info => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`));
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});
export const logger = winston.createLogger({
    level: "debug",
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
        })
    ],
});
//# sourceMappingURL=logger.js.map