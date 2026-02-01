const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const readline = require("readline");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration de l'IA Gemini (dépendance @google/generative-ai)
// Remplace 'TON_API_KEY' par ta clé Google AI si tu en as une
const genAI = new GoogleGenerativeAI("TON_API_KEY");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startOtsutsuki() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Otsutsuki-MD", "Safari", "2.0.0"],
    });

    // --- SYSTÈME PAIRING CODE ---
    if (!sock.authState.creds.registered) {
        console.clear();
        console.log("🌕 --- OTSUTSUKI-MD CONNECTION --- 🌕");
        const phoneNumber = await question("➤ Entre ton numéro (ex: 225XXXXXXXX) : ");
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n💠 TON CODE DE COUPLAGE : ${code}\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- GESTIONNAIRE DE MESSAGES ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const prefix = "."; // Préfixe personnalisé pour Otsutsuki

        if (text.startsWith(prefix)) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch (command) {
                case 'ping':
                    await sock.sendMessage(from, { text: "🏮 *OTSUTSUKI-MD* est prêt au combat !" });
                    break;

                case 'ai':
                    if (!args.length) return sock.sendMessage(from, { text: "Pose-moi une question après .ai" });
                    try {
                        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                        const result = await model.generateContent(args.join(" "));
                        const response = await result.response;
                        await sock.sendMessage(from, { text: `💠 *Otsutsuki-AI* :\n\n${response.text()}` });
                    } catch (e) {
                        await sock.sendMessage(from, { text: "Désolé, l'IA est épuisée..." });
                    }
                    break;

                case 'menu':
                    const menu = `🌕 *OTSUTSUKI-MD V7* 🌕\n\n` +
                                 `╭───〖 COMMANDES 〗\n` +
                                 `│ 💠 ${prefix}ping\n` +
                                 `│ 💠 ${prefix}ai [votre question]\n` +
                                 `│ 💠 ${prefix}menu\n` +
                                 `╰───────────────`;
                    await sock.sendMessage(from, { text: menu });
                    break;
            }
        }
    });

    // --- CONNEXION UPDATE ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? 
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
            if (shouldReconnect) startOtsutsuki();
        } else if (connection === 'open') {
            console.log('🌕 OTSUTSUKI-MD CONNECTÉ AVEC SUCCÈS !');
        }
    });
}

startOtsutsuki();