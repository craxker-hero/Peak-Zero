import { isAdmin, getGroupData } from '../lib/groupManager.js';

export const command = {
    name: 'infogp',
    alias: ['gp', 'groupinfo'],
    description: 'Muestra la configuración actual del grupo.',
    async execute(sock, msg, args, groupMetadata) {
        try {
            const groupId = msg.key.remoteJid;
            if (!groupId.endsWith('@g.us')) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Este comando solo funciona en grupos.' });
                return;
            }

            // Verificar si el bot es administrador
            const botAdmin = await isAdmin(groupId, sock.user.id.split(':')[0] + '@s.whatsapp.net');
            
            // Obtener configuraciones guardadas (ejemplo: desde una DB o JSON)
            const groupData = await getGroupData(groupId) || {
                antilink: false,
                welcome: false,
                nsfw: false,
            };

            // Formatear la información
            const infoText = `
🔍 *INFORMACIÓN DEL GRUPO* 🔍

📌 *Nombre:* ${groupMetadata.subject || 'Desconocido'}
👥 *Participantes:* ${groupMetadata.participants.length} miembros
🛡️ *Bot como admin:* ${botAdmin ? '✅ Sí' : '❌ No'}

⚙️ *Configuraciones del Bot:*
🔗 *Anti-link:* ${groupData.antilink ? '✅ Activado' : '❌ Desactivado'}
🎉 *Welcome:* ${groupData.welcome ? '✅ Activado' : '❌ Desactivado'}
🔞 *NSFW:* ${groupData.nsfw ? '✅ Activado' : '❌ Desactivado'}
            `;

            await sock.sendMessage(groupId, { text: infoText });
        } catch (error) {
            console.error('Error en comando infogp:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Ocurrió un error al obtener la información del grupo.' });
        }
    },
};

export default command;