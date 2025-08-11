const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;
    
    const chat = global.db.data.chats[m.chat];
    const bot = global.db.data.settings[this.user.jid] || {};
    const isGroupLink = linkRegex.test(m.text);

    // Verificar si el mensaje contiene un enlace de WhatsApp y si el antiLink está activado
    if (chat.antiLink && isGroupLink && !isAdmin) {
        // Si el bot es admin, verifica si el enlace es del mismo grupo
        if (isBotAdmin) {
            const groupInviteCode = await this.groupInviteCode(m.chat).catch(() => null);
            const linkThisGroup = `https://chat.whatsapp.com/${groupInviteCode}`;
            if (m.text.includes(linkThisGroup)) return true; // Permitir enlace del propio grupo
        }

        // Notificar eliminación y mencionar al usuario
        await conn.sendMessage(
            m.chat,
            { 
                text: `*@${m.sender.split('@')[0]}* fue eliminado por \`Anti - Link\``,
                mentions: [m.sender]
            },
            { quoted: m }
        );

        // Eliminar el mensaje con el link (si el bot es admin)
        if (isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
        }
    }
    return true;
}