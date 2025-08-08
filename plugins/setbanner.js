import { tmpdir } from 'os'
import { join } from 'path'
import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime.startsWith('image/')) {
        throw `✯ Responde a una imagen con el comando *${usedPrefix + command}* para establecerla como banner del menú.`
    }
    
    try {
        let media = await q.download()
        let path = join(tmpdir(), 'banner.jpg')
        fs.writeFileSync(path, media)
        
        global.db.data.settings[conn.user.jid].banner = path
        m.reply('✯ El banner del menú ha sido actualizado correctamente.')
    } catch (e) {
        console.error(e)
        m.reply('✯ Ocurrió un error al actualizar el banner.')
    }
}

handler.help = ['set banner']
handler.tags = ['owner']
handler.command = /^(setbanner|setbanner)$/i
handler.rowner = true

export default handler
