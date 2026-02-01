module.exports = {
    name: "kick",
    category: "admin",
    async execute(sock, m, { isBotAdmin, isAdmin }) {
        if (!m.isGroup) return m.reply("Uniquement en groupe !");
        if (!isAdmin) return m.reply("Tu n'es pas admin.");
        if (!isBotAdmin) return m.reply("Le bot doit être admin.");
        let user = m.mentionedJid[0] || m.quoted?.sender;
        if (!user) return m.reply("Mentionne quelqu'un !");
        await sock.groupParticipantsUpdate(m.chat, [user], "remove");
        m.reply("👤 Utilisateur expulsé.");
    }
};
