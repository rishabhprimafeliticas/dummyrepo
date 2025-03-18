
const { createLogger, transports, format } = require('winston');

exports.logger = createLogger({
    transports: [
        new transports.File({
            filename: 'errors.log',
            level: 'error',
            format: format.combine(format.timestamp(), format.json())
        }), new transports.File({
            filename: 'info.log',
            level: 'info',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
})
