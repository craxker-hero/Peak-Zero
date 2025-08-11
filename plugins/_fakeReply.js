import fetch from 'node-fetch'

export async function before(m, { conn, groupMetadata, participants }) {
    try {
        if (!m.messageStubType || !m.isGroup) return;

        // Configuración reutilizable
        const botConfig = {
            name: botname,
            description: textbot,
            media: {
                url: canal,
                type: 1 // 1 = PHOTO
            }
        };

        // Función mejorada para obtener imagen
        async function getProfileImage(userId) {
            try {
                // Primero intentamos con la imagen de perfil
                const pp = await conn.profilePictureUrl(userId, 'image');
                const response = await fetch(pp);
                if (!response.ok) throw new Error('Imagen no disponible');
                return await response.buffer();
            } catch (error) {
                console.error('Error al cargar imagen de perfil:', error);
                // Si falla, intentamos con una imagen local o base64
                try {
                    // Aquí puedes poner una imagen local o en base64 como respaldo
                    return await fs.promises.readFile('./assets/default.jpg');
                } catch {
                    return null; // Si todo falla, retornamos null
                }
            }
        }

        // Verificar si el chat tiene bienvenidas activadas
        const chat = global.db.data.chats[m.chat];
        if (!chat.bienvenida) return;

        const groupName = groupMetadata?.subject || 'el grupo';
        const userMention = `@${m.messageStubParameters[0].split('@')[0]}`;
        
        // Mensajes base
        const messageTemplates = {
            27: `*Bienvenido* a ${groupName}!\n\t✰ ${userMention}\n\nBienvenido a ${groupName}, que disfrute su estadía\n\n> 🜸 Puedes usar */help* para ver la lista de comandos.`,
            28: `*Hasta luego* de ${groupName}!\n\t✰ ${userMention}\n\nEspero que vuelvas pronto a ${groupName}\n\n> 🜸 Puedes usar */help* para ver la lista de comandos.`,
            32: () => {
                const admin = participants.find(p => p.admin && p.id !== m.messageStubParameters[0]);
                const adminMention = admin ? `@${admin.id.split('@')[0]}` : '@admin';
                return `*Hasta luego* de ${groupName}!\n\t✰ ${userMention}\n\t\t✰ Eliminado por ${adminMention}\n\nEspero que vuelvas pronto a ${groupName}\n\n> 🜸 Puedes usar */help* para ver la lista de comandos.`;
            }
        };

        const message = messageTemplates[m.messageStubType]?.();
        if (!message) return;

        // Configuración de canal
        const channels = [{
            id: "120363420466566193@newsletter",
            name: "【 ✯ Mila - Wa Team ✰ 】",
            description: "Vibes positivas y contenido único"
        }];

        const randomChannel = channels[Math.floor(Math.random() * channels.length)];

        // Obtener imagen (solo si vamos a usarla)
        const img = await getProfileImage(m.messageStubParameters[0]);

        // Configuración para el envío del mensaje
        const messageOptions = {
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: randomChannel.id,
                    serverMessageId: Math.floor(Math.random() * 1000),
                    newsletterName: randomChannel.name
                },
                externalAdReply: {
                    showAdAttribution: true,
                    title: botConfig.name,
                    body: botConfig.description,
                    mediaUrl: botConfig.media.url,
                    mediaType: botConfig.media.type,
                    description: randomChannel.description,
                    previewType: "PHOTO",
                    ...(img && { thumbnail: img }), // Solo añade thumbnail si existe img
                    sourceUrl: botConfig.media.url
                }
            }
        };

        await conn.sendMessage(m.chat, { 
            text: message, 
            mentions: [m.messageStubParameters[0]], 
            ...messageOptions 
        });

    } catch (error) {
        console.error('Error en la función before:', error);
    }
}