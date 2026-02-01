module.exports = {
    name: "alive",
    category: "general",
    desc: "Vérifie si le bot est actif",
    async execute(sock, m) {
        const status = `🏮 *OTSUTSUKI-MD V2 EST EN LIGNE* 🏮\n\n` +
                       `✨ *Propriétaire:* Dorcas-dodo\n` +
                       `🚀 *Vitesse:* Rapide\n` +
                       `🤖 *Statut:* Opérationnel\n\n` +
                       `_Tape .menu pour voir toutes mes commandes._`;
        
        await sock.sendMessage(m.chat, { 
            image: { url: "https://files.catbox.moe/w2axzk.jpg" }, 
            caption: status 
        }, { quoted: m });
    }
};