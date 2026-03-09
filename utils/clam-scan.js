const NodeClam = require('clamscan');

const clamscan = new NodeClam().init({
    removeInfected: true,
    quarantineInfected: false,
    scanRecursively: false,
    clamdscan: {
        host: process.env.CLAMAV_HOST || '127.0.0.1',
        port: parseInt(process.env.CLAMAV_PORT) || 3310,
        timeout: 60000,
        localFallback: true
    },
    preference: 'clamdscan'
});

module.exports = clamscan;