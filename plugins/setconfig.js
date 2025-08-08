const { setConfig, getConfig } = require('../../settings');
const fs = require('fs');
const path = require('path');

console.log('[DEBUG] Plugin setconfig cargado'); // Log de diagnóstico

module.exports = {
    name: "setconfig",
    alias: ["set"],
    description: "Configura el nombre del bot y el banner",
    ownerOnly: true,
    execute: async (client, msg, args) => {
        console.log('[DEBUG] Comando setconfig recibido', args); // Log de diagnóstico
        
        try {
            const config = getConfig();
            console.log('[DEBUG] Configuración actual:', config); // Log de diagnóstico
            
            // Comando /set banner
            if (args[0] === 'banner') {
                console.log('[DEBUG] Modo banner detectado'); // Log de diagnóstico
                
                if (msg.hasMedia) {
                    console.log('[DEBUG] Media adjunta detectada'); // Log de diagnóstico
                    const media = await msg.downloadMedia();
                    const bannerPath = path.join(__dirname, '../../storage/img/menu.jpg');
                    
                    fs.writeFileSync(bannerPath, media.data, 'base64');
                    setConfig({ banner: 'storage/img/menu.jpg' });
                    
                    return await client.sendMessage(msg.from, { 
                        text: '✅ Banner actualizado correctamente' 
                    });
                } else if (args[1]) {
                    console.log('[DEBUG] URL de banner proporcionada:', args[1]); // Log de diagnóstico
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
            
            // Comando /set botname
            if (args[0] === 'botname' && args[1]) {
                console.log('[DEBUG] Cambio de nombre detectado'); // Log de diagnóstico
                const newName = args.slice(1).join(' ');
                setConfig({ name: newName });
                return await client.sendMessage(msg.from, { 
                    text: `✅ Nombre del bot cambiado a: ${newName}`
                });
            }
            
            // Mostrar ayuda
            console.log('[DEBUG] Mostrando ayuda'); // Log de diagnóstico
            await client.sendMessage(msg.from, {
                text: `*Configuración del Bot*\n\n` +
                      `⚙️ *Comandos disponibles:*\n` +
                      `▸ /set banner [imagen adjunta o URL] - Cambia el banner del menú\n` +
                      `▸ /set botname [nuevo nombre] - Cambia el nombre del bot\n\n` +
                      `📌 *Configuración actual:*\n` +
                      `▸ Nombre: ${config.name}\n` +
                      `▸ Banner: ${config.banner}`
            });
            
        } catch (error) {
            console.error('[ERROR] en setconfig:', error); // Log de errores
            await client.sendMessage(msg.from, {
                text: '❌ Ocurrió un error al procesar el comando'
            });
        }
    }
};