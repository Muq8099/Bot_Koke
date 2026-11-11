const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, BufferJSON } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const express = require('express');

// سيرفر وهمي بسيط عشان Render ما يقفل الخدمة
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // طباعة الـ QR كرموز في السجلات عشان تقدر تقراها أو تربط منها
        if (qr) {
            console.log('Scan the QR code below: ');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot connected successfully!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text === '.مرحبا' || text === '.menu') {
            await sock.sendMessage(sender, { text: 'أهلاً بك! بوت كوك يعمل بنجاح 🚀' });
        }
    });
}

startBot();
