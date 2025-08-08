const { setConfig, getConfig } = require('../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "setconfig",
    alias: [],
    description: "Configura el nombre del bot y el banner",
    ownerOnly: true,
    execute: async (client, msg, args) => {
        const config = getConfig();
        
        // Comando /setbanner
        if (args[0] === 'banner') {
            if (msg.hasMedia) {
                // Si se envía una imagen como media
                const media = await msg.downloadMedia();
                const bannerPath = path.join(__dirname, '../storage/img/menu.jpg');
                
                fs.writeFileSync(bannerPath, media.data, 'base64');
                setConfig({ banner: 'storage/img/menu.jpg' });
                
                return await client.sendMessage(msg.from, { 
                    text: '✅ Banner actualizado correctamente' 
                });
            } else if (args[1]) {
                // Si se proporciona una URL
                setConfig({ banner: args[1] });
                return await client.sendMessage(msg.from, { 
                    text: '✅ Banner (URL) actualizado correctamente' 
                });
            } else {
                return await client.sendMessage(msg.from, { 
                    text: 'Por favor envía una imagen o proporciona una URL.\nEjemplo: /set banner [imagen adjunta] o /set banner https://url.com/banner.jpg'
                });
            }
        }
        
        // Comando /setbotname
        if (args[0] === 'botname' && args[1]) {
            const newName = args.slice(1).join(' ');
            setConfig({ name: newName });
            return await client.sendMessage(msg.from, { 
                text: `✅ Nombre del bot cambiado a: ${newName}`
            });
        }
        
        // Mostrar ayuda si no se usan correctamente
        await client.sendMessage(msg.from, {
            text: `*Configuración del Bot*\n\n` +
                  `⚙️ *Comandos disponibles:*\n` +
                  `▸ /set banner [imagen adjunta o URL] - Cambia el banner del menú\n` +
                  `▸ /set botname [nuevo nombre] - Cambia el nombre del bot\n\n` +
                  `📌 *Configuración actual:*\n` +
                  `▸ Nombre: ${config.name}\n` +
                  `▸ Banner: ${config.banner}`
        });
    }
};