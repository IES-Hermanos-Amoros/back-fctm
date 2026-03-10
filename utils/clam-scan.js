require('dotenv').config();
const NodeClam = require('clamscan');

const CLAMSCAN_ACTIVE = process.env.VIRUSCAN_CLAMSCAN_ACTIVE === "1";

let clamscan = null;

if (CLAMSCAN_ACTIVE) {
    clamscan = new NodeClam().init({
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
    }).then(scanner => {
        console.log(`✅ ClamAV scanner inicializado correctamente a ${process.env.CLAMAV_HOST || '127.0.0.1'}:${process.env.CLAMAV_PORT || 3310}`);
        return scanner;
    })
    .catch(err => {
        console.error("❌ Error inicializando ClamAV:");
        console.error(err.message);
        return null;
    });
} else {
    console.warn("⚠️ ClamAV scanning is disabled. Set VIRUSCAN_CLAMSCAN_ACTIVE=1 to enable it.");
}


module.exports = {
    CLAMSCAN_ACTIVE,
    clamscan
};