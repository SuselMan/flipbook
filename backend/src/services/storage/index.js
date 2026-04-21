const driver = process.env.STORAGE_DRIVER || 'local';

let impl;
switch (driver) {
    case 'local':
        impl = require('./local');
        break;
    case 's3':
        impl = require('./s3');
        break;
    default:
        throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
}

module.exports = impl;
