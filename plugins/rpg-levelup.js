import { canLevelUp, xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user) {
        global.db.data.users[m.sender] = {
            name: conn.getName(m.sender),
            exp: 0,
            level: 0,
            lastActive: +new Date()
        }
        user = global.db.data.users[m.sender]
    }

    let img = await (await fetch('https://telegra.ph/file/b97148e2154508f63d909.jpg')).buffer()
    
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
        let currentXP = user.exp - min
        let progress = Math.floor((currentXP / xp) * 100)
        
        let txt = `*「✿」Sistema de Niveles*\n\n`
        txt += `▸ *Usuario*: ${conn.getName(m.sender)}\n`
        txt += `▸ *Nivel actual*: ${user.level}\n`
        txt += `▸ *Experiencia*: ${user.exp} XP\n`
        txt += `▸ *Progreso*: ${currentXP}/${xp} (${progress}%)\n\n`
        txt += `¡Necesitas *${max - user.exp} XP* más para subir de nivel!\n\n`
        txt += `Usa *${usedPrefix}help* para ver comandos disponibles`
        
        await conn.sendFile(m.chat, img, 'level.jpg', txt, m)
        return
    }
    
    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
    
    if (before !== user.level) {
        let txt = `*「🎉 ¡Level Up!」*\n\n`
        txt += `▸ *Usuario*: ${conn.getName(m.sender)}\n`
        txt += `▸ *Nivel anterior*: ${before}\n`
        txt += `▸ *Nuevo nivel*: ${user.level}\n\n`
        txt += `¡Felicidades! Sigue interactuando para subir más`
        
        await conn.sendFile(m.chat, img, 'levelup.jpg', txt, m)
    }
}

handler.help = ['level [info]', 'nivel [info]']
handler.tags = ['xp']
handler.command = /^(nivel|lvl|level|levelup|niveles)$/i

export default handler