const fs = require('fs');
const path = require('path');

// Conteneur pour stocker les commandes
const commands = new Map();

// Fonction pour charger les commandes
function loadCommands() {
    const cmdsPath = path.join(__currentDir, 'commands'); // ou 'cmds' selon ton dossier
    const categories = fs.readdirSync(cmdsPath);

    for (const category of categories) {
        const folderPath = path.join(cmdsPath, category);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            for (const file of files) {
                const command = require(path.join(folderPath, file));
                commands.set(command.name, command);
            }
        }
    }
    console.log(`✅ ${commands.size} commandes chargées avec succès !`);
}

// Dans ton sock.ev.on('messages.upsert', ...)
sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const prefix = ".";
    
    if (body.startsWith(prefix)) {
        const args = body.slice(prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const command = commands.get(cmdName);

        if (command) {
            try {
                await command.execute(sock, m, { args });
            } catch (error) {
                console.error(error);
                await sock.sendMessage(m.key.remoteJid, { text: "❌ Erreur lors de l'exécution." });
            }
        }
    }
});

loadCommands();
