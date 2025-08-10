import { canLevelUp, xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
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

    // Imagen de fondo para el level up
    let img = await (await fetch('https://telegra.ph/file/b97148e2154508f63d909.jpg')).buffer()
    
    // Verificar si puede subir de nivel
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
        let currentXP = user.exp - min
        let progress = Math.floor((currentXP / xp) * 100)
        
        let txt = `*「✿」Sistema de Niveles*\n\n`
        txt += `▸ *Usuario*: ${conn.getName(m.sender)}\n`
        txt += `▸ *Nivel actual*: ${user.level}\n`
        txt += `▸ *Experiencia (XP)*: ${user.exp}\n`
        txt += `▸ *Progreso*: ${currentXP}/${xp} (${progress}%)\n\n`
        txt += `¡Necesitas *${max - user.exp} XP* más para subir de nivel!`
        
        await conn.sendFile(m.chat, img, 'level.jpg', txt, m)
        return
    }
    
    // Subir de nivel
    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
    
    if (before !== user.level) {
        let txt = `*「🎉 ¡Level Up!」*\n\n`
        txt += `▸ *Usuario*: ${conn.getName(m.sender)}\n`
        txt += `▸ *Nivel anterior*: ${before}\n`
        txt += `▸ *Nuevo nivel*: ${user.level}\n\n`
        txt += `¡Sigue interactuando para subir más de nivel!`
        
        await conn.sendFile(m.chat, img, 'levelup.jpg', txt, m)
    }
}

// Sistema de experiencia automático
handler.before = async function (m) {
    if (m.isCommand && !m.isGroup) {
        let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        
        // XP por comando (5-15 puntos aleatorios)
        let xpEarned = Math.floor(Math.random() * 11) + 5
        user.exp = (user.exp || 0) + xpEarned
        
        // Actualizar última actividad
        user.lastActive = +new Date()
    }
    return true
}

handler.help = ['level', 'nivel']
handler.tags = ['rpg']
handler.command = /^(nivel|lvl|level|levelup|niveles)$/i
export default handler