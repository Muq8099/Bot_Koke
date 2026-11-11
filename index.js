    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('QRCODE_STRING:', qr);
            qrcode.generate(qr, { small: true });
        }
        // باقي كود الاتصال...
