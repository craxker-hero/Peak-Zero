import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    let user = global.db.data.users[who] || {}
    
    // Valores seguros
    let exp = Number(user.exp) || 0
    let level = Number(user.level) || 0
    let { min, xp } = xpRange(level, global.multiplier || 1)
    
    // Cálculo preciso del progreso
    let currentXP = Math.max(0, exp - min)
    let neededXP = Math.max(1, xp)
    let progress = Math.min(100, Math.floor((currentXP / neededXP) * 100))

    let txt = `「✿」 *Perfil* ◢ ${user.name || conn.getName(who)} ◤\n\n`
    txt += `♛ Cumpleaños » *${user.birthdate ? user.birthdate.split('/').slice(0,2).join('/') : 'Sin especificar (/setbirth)'}*\n`
    txt += `♛ Género » *${user.gender || 'Sin especificar'}*\n\n`
    txt += `☆ Experiencia » *${exp}*\n`
    txt += `❖ Nivel » *${level}*\n`
    txt += `➨ Progreso » *${currentXP} => ${neededXP}*  _(${progress}%)_\n`
    txt += `# Puesto » *#${Math.floor(Math.random() * 1000000)}*\n\n`
    txt += `✧ Comandos usados » *${user.commandCount || 0}*`

    await conn.reply(m.chat, txt, m)
}

handler.help = ['perfil', 'profile']
handler.tags = ['rg']
handler.command = /^(perfil|profile)$/i
export default handler