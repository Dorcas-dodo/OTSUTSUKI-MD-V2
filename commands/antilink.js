module.exports = {
    name: "antilink",
    category: "admin",
    desc: "Active/Désactive l'anti-lien",
    async execute(sock, m, { args, isBotAdmin, isAdmin }) {
        if (!m.isGroup) return m.reply("Uniquement en groupe !");
        if (!isAdmin) return m.reply("Tu n'es pas admin.");
        if (!isBotAdmin) return m.reply("Donne-moi les droits d'admin d'abord.");

        const text = m.body.toLowerCase();
        if (text.includes("chat.whatsapp.com/")) {
            await sock.sendMessage(m.chat, { delete: m.key });
            await sock.groupParticipantsUpdate(m.chat, [m.sender], "remove");
            m.reply("🚫 *Lien détecté :* Utilisateur banni.");
        }
    }
};
