module.exports = {
    name: 'kickall',
    description: 'Expulse tous les membres du groupe',
    category: 'admin',
    async execute(client, message, args) {
        // Vérifier si c'est un groupe
        if (!message.isGroup) return message.reply('Cette commande ne fonctionne que dans les groupes.');
        
        // Vérifier si l'utilisateur est admin ou sudo
        if (!message.isAdmin && !message.isSudo) return message.reply('Seuls les administrateurs peuvent utiliser cette commande.');

        // Récupérer les membres
        const groupMetadata = await client.groupMetadata(message.from);
        const participants = groupMetadata.participants;

        message.reply('Nettoyage du groupe en cours...');

        for (let member of participants) {
            // Ne pas s'expulser soi-même ou le propriétaire
            if (member.id !== client.user.id && !member.admin) {
                await client.groupParticipantsUpdate(message.from, [member.id], "remove");
            }
        }
        
        message.reply('Tous les membres non-admins ont été retirés.');
    }
};