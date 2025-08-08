let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        throw `✯ Ingresa el nuevo nombre para el bot. Ejemplo: *${usedPrefix + command} NuevoNombre*`
    }
    
    try {
        global.db.data.settings[conn.user.jid].botname = text
        m.reply(`✯ El nombre del bot ha sido actualizado a *${text}*.`)
    } catch (e) {
        console.error(e)
        m.reply('✯ Ocurrió un error al actualizar el nombre del bot.')
    }
}

handler.help = ['set botname']
handler.tags = ['owner']
handler.command = /^(setbotname|setnamebot)$/i
handler.rowner = true

export default handler
