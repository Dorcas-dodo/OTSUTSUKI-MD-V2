module.exports = {
    name: "antidelete",
    async execute(sock, m, { store }) {
        // Cette logique doit être placée dans le gestionnaire d'événements 'messages.delete' de ton index.js
        sock.ev.on('messages.delete', async (item) => {
            if (item.origin) {
                const data = await store.loadMessage(item.remoteJid, item.id);
                if (!data) return;
                const user = data.key.participant || data.key.remoteJid;
                await sock.sendMessage(m.chat, { 
                    text: `🕵️ *MESSAGE SUPPRIMÉ DÉTECTÉ*\n\n👤 *Auteur:* @${user.split("@")[0]}\n💬 *Contenu:* ${data.message.conversation}`,
                    mentions: [user]
                });
            }
        });
    }
};
