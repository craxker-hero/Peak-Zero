import { xpRange } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[who] || {}
    
    // Obtener foto de perfil
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
    
    // Valores seguros
    let exp = Number(user.exp) || 0
    let level = Number(user.level) || 0
    let { min, xp } = xpRange(level, global.multiplier || 1)
    
    // Cálculo preciso del progreso
    let currentXP = Math.max(0, exp - min)
    let neededXP = Math.max(1, xp)
    let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100))

    // Información de cumpleaños
    let birthdayInfo = user.birthdate 
        ? `${user.birthdate.split('/')[0]}/${user.birthdate.split('/')[1]} (${user.age} años)`
        : 'Sin especificar (/setbirth)'

    // Generar mensaje
    let txt = `「✿」 *Perfil* ◢ ${user.name || conn.getName(who)} ◤\n\n`
    txt += `♛ Cumpleaños » *${birthdayInfo}*\n`
    txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
    txt += `☆ Experiencia » *${exp.toLocaleString('es-ES')}*\n`
    txt += `❖ Nivel » *${level.toLocaleString('es-ES')}*\n`
    txt += `➨ Progreso » *${currentXP.toLocaleString('es-ES')}/${neededXP.toLocaleString('es-ES')}*  _(${progress}%)_\n`
    txt += `# Puesto » *#${Math.floor(Math.random() * 1000000).toLocaleString('es-ES')}*\n\n`
    txt += `✧ Comandos usados » *${(user.commandCount || 0).toLocaleString('es-ES')}*`

    // Enviar mensaje con foto de perfil
    try {
        let img = await (await fetch(pp)).buffer()
        await conn.sendMessage(m.chat, {
            image: img,
            caption: txt,
            mentions: [who]
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        await conn.reply(m.chat, txt, m)
    }
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler