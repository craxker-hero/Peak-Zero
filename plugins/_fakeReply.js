import fetch from 'node-fetch';

export async function before(m, { conn }) {
    try {
        // Configuración reutilizable
        const botConfig = {
            name: botname,
            description: textbot,
            media: {
                url: canal,
                type: 1 // 1 = PHOTO
            }
        };

        // Obtener imagen optimizado con manejo de errores
        let img;
        try {
            const imageUrl = 'https://qu.ax/nUsJt.jpg'; // Considera usar una URL directa si es posible
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Error al obtener imagen: ${response.status}`);
            img = await response.buffer();
        } catch (error) {
            console.error('Error al cargar la imagen:', error);
            img = null; // O podrías establecer una imagen por defecto
        }

        // Canales disponibles
        const channels = [
            {
                id: "120363191779210764@newsletter",
                name: "【 ✯ Starlights Team - Oficial Channel ✰ 】",
                description: "Canal oficial del equipo Starlights"
            },
            {
                id: "120363420466566193@newsletter",
                name: "✰ Let Go Vibes World ダーク",
                description: "Vibes positivas y contenido único"
            }
        ];

        // Selección aleatoria de canal
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];

        // Configuración global optimizada
        global.rcanal = {
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: randomChannel.id,
                    serverMessageId: 100, // Considera generar un ID único si es necesario
                    newsletterName: randomChannel.name
                }
            }
        };

        global.adReply = {
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: false,
                externalAdReply: {
                    showAdAttribution: true,
                    title: botConfig.name,
                    body: botConfig.description,
                    mediaUrl: botConfig.media.url,
                    mediaType: botConfig.media.type,
                    description: randomChannel.description, // Añadido descripción del canal
                    previewType: "PHOTO",
                    thumbnailUrl: img,
                    thumbnail: img,
                    sourceUrl: botConfig.media.url,
                    renderLargerThumbnail: true
                }
            }
        };

    } catch (error) {
        console.error('Error en la función before:', error);
        // Podrías añadir un manejo de errores más específico aquí
    }
}